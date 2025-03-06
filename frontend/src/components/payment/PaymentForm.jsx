import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import { useCreatePayment, useUpdatePayment, useAvailablePeriods } from '../../hooks/usePaymentData';
import { useClientContract, useClient } from '../../hooks/useClientData';
import { formatCurrency } from '../../lib/feeUtils';
import useStore from '../../store';

const PaymentForm = ({ clientId }) => {
  const { editingPayment, clearEditingPayment, isFormDirty, setFormDirty } = useStore();
  const { data: contract, isLoading: isContractLoading } = useClientContract(clientId);
  const { data: client, isLoading: isClientLoading } = useClient(clientId);
  const { data: periodsData, isLoading: isPeriodsLoading } = useAvailablePeriods(
    contract?.contract_id, 
    clientId
  );
  
  const createPaymentMutation = useCreatePayment();
  const updatePaymentMutation = useUpdatePayment();
  
  // Initial form state for comparison
  const defaultFormValues = {
    received_date: new Date().toISOString().split('T')[0],
    total_assets: '',
    actual_fee: '',
    expected_fee: '',
    method: '',
    notes: '',
    is_split_payment: false,
    start_period: '',
    end_period: '',
  };
  
  const [formValues, setFormValues] = useState(defaultFormValues);
  const [initialFormState, setInitialFormState] = useState(defaultFormValues);
  const [formErrors, setFormErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Reset form when client changes or when editing payment changes
  useEffect(() => {
    if (clientId && !editingPayment) {
      const newFormValues = {
        received_date: new Date().toISOString().split('T')[0],
        total_assets: '',
        actual_fee: '',
        expected_fee: '',
        method: '',
        notes: '',
        is_split_payment: false,
        start_period: '',
        end_period: '',
      };
      setFormValues(newFormValues);
      setInitialFormState({...newFormValues});
      setFormErrors({});
      setFormDirty(false);
    }
  }, [clientId, editingPayment, setFormDirty]);
  
  // Populate form when editing a payment
  useEffect(() => {
    if (editingPayment) {
      const formattedValues = {
        received_date: editingPayment.received_date,
        total_assets: editingPayment.total_assets?.toString() || '',
        actual_fee: editingPayment.actual_fee?.toString() || '',
        expected_fee: editingPayment.expected_fee?.toString() || '',
        method: editingPayment.method || '',
        notes: editingPayment.notes || '',
        is_split_payment: editingPayment.is_split_payment || false,
        start_period: isMonthlySchedule(editingPayment) 
          ? `${editingPayment.applied_start_month}-${editingPayment.applied_start_month_year}`
          : `${editingPayment.applied_start_quarter}-${editingPayment.applied_start_quarter_year}`,
        end_period: editingPayment.is_split_payment 
          ? (isMonthlySchedule(editingPayment)
              ? `${editingPayment.applied_end_month}-${editingPayment.applied_end_month_year}`
              : `${editingPayment.applied_end_quarter}-${editingPayment.applied_end_quarter_year}`)
          : '',
      };
      
      setFormValues(formattedValues);
      setInitialFormState({...formattedValues});
      setFormDirty(false);
    }
  }, [editingPayment, setFormDirty]);

  // Helper function to determine if payment is using monthly schedule
  const isMonthlySchedule = (payment) => {
    return payment.applied_start_month !== null;
  };
  
  // Check if form is dirty on any input change
  useEffect(() => {
    const isDirty = JSON.stringify(formValues) !== JSON.stringify(initialFormState);
    setFormDirty(isDirty);
  }, [formValues, initialFormState, setFormDirty]);
  
  // Calculate expected fee when total_assets changes
  useEffect(() => {
    if (contract && formValues.total_assets && contract.fee_type === 'percentage') {
      const assets = parseFloat(formValues.total_assets);
      if (!isNaN(assets) && contract.percent_rate) {
        const expected = assets * contract.percent_rate;
        setFormValues(prev => ({
          ...prev,
          expected_fee: expected.toFixed(2)
        }));
      }
    } else if (contract && contract.fee_type === 'flat' && contract.flat_rate) {
      setFormValues(prev => ({
        ...prev,
        expected_fee: contract.flat_rate.toFixed(2)
      }));
    }
  }, [contract, formValues.total_assets]);
  
  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };
  
  const handleSplitToggle = () => {
    setFormValues(prev => ({
      ...prev,
      is_split_payment: !prev.is_split_payment,
      end_period: !prev.is_split_payment ? prev.start_period : ''
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = {};
    
    if (!formValues.received_date) {
      errors.received_date = 'Received date is required';
    }
    
    if (!formValues.actual_fee) {
      errors.actual_fee = 'Payment amount is required';
    } else if (isNaN(parseFloat(formValues.actual_fee))) {
      errors.actual_fee = 'Payment amount must be a number';
    }
    
    if (!formValues.start_period) {
      errors.start_period = 'Applied period is required';
    }
    
    if (formValues.is_split_payment && !formValues.end_period) {
      errors.end_period = 'End period is required for split payments';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const paymentData = {
      contract_id: contract.contract_id,
      client_id: clientId,
      received_date: formValues.received_date,
      total_assets: formValues.total_assets ? parseFloat(formValues.total_assets) : null,
      expected_fee: formValues.expected_fee ? parseFloat(formValues.expected_fee) : null,
      actual_fee: parseFloat(formValues.actual_fee),
      method: formValues.method || null,
      notes: formValues.notes || null,
    };
    
    const isMonthly = contract.payment_schedule === 'monthly';
    const startPeriodParts = formValues.start_period.split('-');
    
    if (isMonthly) {
      paymentData.applied_start_month = parseInt(startPeriodParts[0], 10);
      paymentData.applied_start_month_year = parseInt(startPeriodParts[1], 10);
      
      if (formValues.is_split_payment) {
        const endPeriodParts = formValues.end_period.split('-');
        paymentData.applied_end_month = parseInt(endPeriodParts[0], 10);
        paymentData.applied_end_month_year = parseInt(endPeriodParts[1], 10);
      } else {
        paymentData.applied_end_month = paymentData.applied_start_month;
        paymentData.applied_end_month_year = paymentData.applied_start_month_year;
      }
    } else {
      paymentData.applied_start_quarter = parseInt(startPeriodParts[0], 10);
      paymentData.applied_start_quarter_year = parseInt(startPeriodParts[1], 10);
      
      if (formValues.is_split_payment) {
        const endPeriodParts = formValues.end_period.split('-');
        paymentData.applied_end_quarter = parseInt(endPeriodParts[0], 10);
        paymentData.applied_end_quarter_year = parseInt(endPeriodParts[1], 10);
      } else {
        paymentData.applied_end_quarter = paymentData.applied_start_quarter;
        paymentData.applied_end_quarter_year = paymentData.applied_start_quarter_year;
      }
    }
    
    if (editingPayment) {
      updatePaymentMutation.mutate(
        { id: editingPayment.payment_id, data: paymentData },
        {
          onSuccess: () => {
            handleReset();
          },
        }
      );
    } else {
      createPaymentMutation.mutate(paymentData, {
        onSuccess: () => {
          handleReset();
        },
      });
    }
  };
  
  const handleReset = () => {
    if (isFormDirty) {
      setShowConfirmDialog(true);
    } else {
      resetForm();
    }
  };
  
  const resetForm = () => {
    const newFormValues = {
      received_date: new Date().toISOString().split('T')[0],
      total_assets: '',
      actual_fee: '',
      expected_fee: '',
      method: '',
      notes: '',
      is_split_payment: false,
      start_period: '',
      end_period: '',
    };
    setFormValues(newFormValues);
    setInitialFormState({...newFormValues});
    setFormErrors({});
    clearEditingPayment();
    setFormDirty(false);
    setShowConfirmDialog(false);
  };
  
  const cancelReset = () => {
    setShowConfirmDialog(false);
  };
  
  const formatPeriodOptions = () => {
    if (!periodsData?.periods) return [];
    
    return periodsData.periods.map(period => ({
      label: period.label,
      value: period.value
    }));
  };
  
  const methodOptions = [
    { label: 'Auto - ACH', value: 'Auto - ACH' },
    { label: 'Auto - Check', value: 'Auto - Check' },
    { label: 'Invoice - Check', value: 'Invoice - Check' },
    { label: 'Wire Transfer', value: 'Wire Transfer' },
    { label: 'Check', value: 'Check' },
  ];
  
  const isDisabled = !clientId || !contract;
  const periodOptions = formatPeriodOptions();
  const isSubmitting = createPaymentMutation.isLoading || updatePaymentMutation.isLoading;
  
  return (
    <Card 
      className="bg-white shadow-md"
      variant="default"
      elevation="default"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-dark-700">
            {editingPayment ? 'Edit Payment' : 'Add Payment'}
            {!isClientLoading && client && (
              <span className="ml-2 text-primary-600">
                for {client.display_name}
              </span>
            )}
          </h2>
        </div>
        {editingPayment && (
          <Button 
            variant="outline"
            onClick={() => {
              clearEditingPayment();
              resetForm();
            }}
          >
            Cancel Edit
          </Button>
        )}
      </div>
      
      {isContractLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : !contract ? (
        <div className="text-center py-8 text-dark-500">
          Please select a client to add payment details
        </div>
      ) : (
        <>
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-dark-800 bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border border-light-400">
              <h3 className="text-lg font-medium mb-4">Unsaved Changes</h3>
              <p className="mb-6 text-gray-600">
                You have unsaved changes. Are you sure you want to clear the form?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-200"
                  onClick={cancelReset}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:shadow-sm transition-all duration-200"
                  onClick={resetForm}
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DatePicker
              label="Received Date"
              value={formValues.received_date}
              onChange={(value) => handleInputChange('received_date', value)}
              required
              disabled={isDisabled}
              error={formErrors.received_date}
            />
            
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Applied Period</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Single</span>
                  <button
                    type="button"
                    className={`h-5 w-10 rounded-full relative ${
                      formValues.is_split_payment ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    onClick={handleSplitToggle}
                    disabled={isDisabled}
                  >
                    <div
                      className={`absolute w-3 h-3 rounded-full bg-white top-1 transition-transform ${
                        formValues.is_split_payment ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                  <span className="text-sm text-gray-500">Split</span>
                </div>
              </div>
              
              <div className={`${formValues.is_split_payment ? 'grid grid-cols-2 gap-2' : 'w-full'}`}>
                <Select
                  options={periodOptions}
                  value={formValues.start_period}
                  onChange={(value) => handleInputChange('start_period', value)}
                  placeholder="Select period"
                  disabled={isDisabled || isPeriodsLoading}
                  required
                  error={formErrors.start_period}
                />
                
                {formValues.is_split_payment && (
                  <Select
                    options={periodOptions}
                    value={formValues.end_period}
                    onChange={(value) => handleInputChange('end_period', value)}
                    placeholder="End period"
                    disabled={isDisabled || isPeriodsLoading}
                    required
                    error={formErrors.end_period}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label="Assets Under Management"
              type="text"
              value={formValues.total_assets}
              onChange={(value) => handleInputChange('total_assets', value)}
              placeholder="Enter AUM (optional)"
              prefix="$"
              disabled={isDisabled}
            />
            
            <Input
              label="Payment Amount"
              type="text"
              value={formValues.actual_fee}
              onChange={(value) => handleInputChange('actual_fee', value)}
              placeholder="Enter payment amount"
              prefix="$"
              required
              disabled={isDisabled}
              error={formErrors.actual_fee}
            />
            
            <Select
              label="Payment Method"
              options={methodOptions}
              value={formValues.method}
              onChange={(value) => handleInputChange('method', value)}
              placeholder="Select method (optional)"
              disabled={isDisabled}
            />
          </div>
          
          <div>
            <button
              type="button"
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isDisabled}
            >
              Notes & Attachments
              <svg
                className={`ml-2 h-4 w-4 transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {showAdvanced && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                <Input
                  label="Notes"
                  type="text"
                  value={formValues.notes}
                  onChange={(value) => handleInputChange('notes', value)}
                  placeholder="Enter any notes about this payment"
                  disabled={isDisabled}
                />
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Attachments</p>
                  <p className="text-xs text-gray-400">
                    File upload functionality will be implemented in a future update.
                  </p>
                </div>
                
                {contract?.fee_type === 'percentage' && formValues.total_assets && (
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium text-blue-800">Expected Fee:</div>
                    <div className="text-blue-600">
                      {formValues.expected_fee
                        ? formatCurrency(parseFloat(formValues.expected_fee))
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      Based on {contract.percent_rate * 100}% of{' '}
                      {formatCurrency(parseFloat(formValues.total_assets))}
                    </div>
                  </div>
                )}
                
                {contract?.fee_type === 'flat' && (
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium text-blue-800">Expected Fee:</div>
                    <div className="text-blue-600">
                      {formatCurrency(contract.flat_rate)}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      Flat fee as specified in contract
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {(createPaymentMutation.isError || updatePaymentMutation.isError) && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              Error: {createPaymentMutation.error?.message || updatePaymentMutation.error?.message}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isDisabled || isSubmitting}
            >
              Clear
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isDisabled || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Submitting...
                </span>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
        </>
      )}
    </Card>
  );
};

export default PaymentForm;