import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import { useCreatePayment, useUpdatePayment, useAvailablePeriods } from '../../hooks/usePaymentData';
import { useClientContract } from '../../hooks/useClientData';
import { formatCurrency } from '../../lib/feeUtils';
import useStore from '../../store';

const PaymentForm = ({ clientId }) => {
  const { editingPayment, clearEditingPayment } = useStore();
  const { data: contract, isLoading: isContractLoading } = useClientContract(clientId);
  const { data: periodsData, isLoading: isPeriodsLoading } = useAvailablePeriods(
    contract?.contract_id, 
    clientId
  );
  
  const createPaymentMutation = useCreatePayment();
  const updatePaymentMutation = useUpdatePayment();
  
  const [formValues, setFormValues] = useState({
    received_date: new Date().toISOString().split('T')[0],
    total_assets: '',
    actual_fee: '',
    expected_fee: '',
    method: '',
    notes: '',
    is_split_payment: false,
    start_period: '',
    end_period: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Reset form when client changes or when editing payment changes
  useEffect(() => {
    if (clientId && !editingPayment) {
      setFormValues({
        received_date: new Date().toISOString().split('T')[0],
        total_assets: '',
        actual_fee: '',
        expected_fee: '',
        method: '',
        notes: '',
        is_split_payment: false,
        start_period: '',
        end_period: '',
      });
      setFormErrors({});
    }
  }, [clientId]);
  
  // Populate form when editing a payment
  useEffect(() => {
    if (editingPayment) {
      const isMonthly = editingPayment.applied_start_month !== null;
      const startPeriod = isMonthly
        ? `${editingPayment.applied_start_month}-${editingPayment.applied_start_month_year}`
        : `${editingPayment.applied_start_quarter}-${editingPayment.applied_start_quarter_year}`;
      
      const endPeriod = isMonthly
        ? `${editingPayment.applied_end_month}-${editingPayment.applied_end_month_year}`
        : `${editingPayment.applied_end_quarter}-${editingPayment.applied_end_quarter_year}`;
      
      const isSplit = isMonthly
        ? (editingPayment.applied_start_month !== editingPayment.applied_end_month || 
           editingPayment.applied_start_month_year !== editingPayment.applied_end_month_year)
        : (editingPayment.applied_start_quarter !== editingPayment.applied_end_quarter || 
           editingPayment.applied_start_quarter_year !== editingPayment.applied_end_quarter_year);
      
      setFormValues({
        received_date: editingPayment.received_date,
        total_assets: editingPayment.total_assets?.toString() || '',
        actual_fee: editingPayment.actual_fee?.toString() || '',
        expected_fee: editingPayment.expected_fee?.toString() || '',
        method: editingPayment.method || '',
        notes: editingPayment.notes || '',
        is_split_payment: isSplit,
        start_period: startPeriod,
        end_period: endPeriod,
      });
      setShowAdvanced(true);
    }
  }, [editingPayment]);
  
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
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
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
    setFormValues({
      received_date: new Date().toISOString().split('T')[0],
      total_assets: '',
      actual_fee: '',
      expected_fee: '',
      method: '',
      notes: '',
      is_split_payment: false,
      start_period: '',
      end_period: '',
    });
    setFormErrors({});
    clearEditingPayment();
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
    <Card title={editingPayment ? "Edit Payment" : "Add Payment"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DatePicker
            label="Received Date"
            value={formValues.received_date}
            onChange={(value) => handleInputChange('received_date', value)}
            required
            disabled={isDisabled}
            error={formErrors.received_date}
          />
          
          <div className="space-y-2">
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
            
            <div className={`flex ${formValues.is_split_payment ? 'space-x-2' : ''}`}>
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
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            type="button"
            onClick={handleReset}
            disabled={isDisabled || isSubmitting}
          >
            {editingPayment ? 'Cancel' : 'Clear'}
          </Button>
          <Button
            type="submit"
            disabled={isDisabled || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : (editingPayment ? 'Update' : 'Submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PaymentForm;