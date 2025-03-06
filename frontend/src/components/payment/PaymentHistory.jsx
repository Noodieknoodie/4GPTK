import React, { useState } from 'react';
import { usePaymentHistory, useDeletePayment } from '../../hooks/usePaymentData';
import { formatDate } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/feeUtils';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import useStore from '../../store';
import Card from '../ui/Card';

const PaymentHistory = ({ clientId }) => {
  const [page, setPage] = useState(1);
  const [year, setYear] = useState(null);
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const { setEditingPayment } = useStore();
  
  const { 
    data: payments = [], 
    isLoading,
    error,
    isPreviousData,
  } = usePaymentHistory(clientId, { page, limit: 10, year });
  
  const deletePaymentMutation = useDeletePayment();
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading payment history: {error.message}
      </div>
    );
  }
  
  const toggleExpandRow = (paymentId) => {
    setExpandedPaymentId(expandedPaymentId === paymentId ? null : paymentId);
  };
  
  const handleEdit = (payment) => {
    setEditingPayment(payment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = (paymentId) => {
    deletePaymentMutation.mutate({ id: paymentId, clientId });
    setShowDeleteConfirm(null);
  };
  
  const currentYear = new Date().getFullYear();
  const availableYears = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    availableYears.push(y);
  }
  
  return (
    <div className="animate-fade-in mt-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-dark-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-500 mr-2">
            <path d="M19 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z"></path>
            <line x1="8" y1="2" x2="8" y2="5"></line>
            <line x1="16" y1="2" x2="16" y2="5"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Payment History
        </h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-dark-500">Filter by Year:</label>
          <select
            className="border border-light-500 rounded-md text-sm p-1.5 bg-white shadow-sm focus:ring-1 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
            value={year || ''}
            onChange={(e) => setYear(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-5">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-light-300 p-5 rounded-lg text-center text-dark-500 shadow-sm">
          No payment records found.
        </div>
      ) : (
        <Card 
          className="p-0 overflow-hidden" 
          elevation="default" 
          variant="default"
        >
          <div className="overflow-x-auto -mx-1">
            <table className="min-w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-light-200 border-b border-light-300">
                  <th className="w-[2%] py-2.5 px-1 text-left text-xs font-medium text-dark-600 uppercase tracking-wider"></th>
                  <th className="w-[11%] py-2.5 px-2 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">Date</th>
                  <th className="w-[17%] py-2.5 px-2 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">Provider</th>
                  <th className="w-[12%] py-2.5 px-2 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">Period</th>
                  <th className="w-[12%] py-2.5 px-2 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">AUM</th>
                  <th className="w-[13%] py-2.5 px-2 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">Expected</th>
                  <th className="w-[13%] py-2.5 px-2 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">Actual</th>
                  <th className="w-[14%] py-2.5 px-2 text-left text-xs font-medium text-dark-600 uppercase tracking-wider">Variance</th>
                  <th className="w-[6%] py-2.5 px-1 text-center text-xs font-medium text-dark-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-light-300">
                {payments.map((payment, index) => (
                  <React.Fragment key={payment.payment_id}>
                    <tr className="hover:bg-light-200">
                      <td className="py-2 px-1">
                        {payment.is_split_payment && (
                          <button
                            className="w-6 h-6 flex items-center justify-center text-dark-400 hover:text-primary-600 transition-colors"
                            onClick={() => toggleExpandRow(payment.payment_id)}
                            aria-label="Toggle payment details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`transition-transform ${
                                expandedPaymentId === payment.payment_id ? 'rotate-90' : ''
                              }`}
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">{formatDate(payment.received_date)}</td>
                      <td className="py-2 px-2 truncate">{payment.provider_name || 'N/A'}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {payment.is_split_payment ? (
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs rounded bg-light-300 text-dark-600">Split</span>
                            <span className="ml-2 text-dark-500">
                              {payment.periods?.length || 0}
                            </span>
                          </div>
                        ) : formatAppliedPeriod(payment)}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {payment.total_assets ? formatCurrency(payment.total_assets) : 'N/A'}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {payment.expected_fee ? formatCurrency(payment.expected_fee) : 'N/A'}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap font-medium">{formatCurrency(payment.actual_fee)}</td>
                      <td className="py-2 px-2">
                        {payment.variance?.status && (
                          <StatusBadge
                            status={payment.variance.status}
                            label={payment.variance.message}
                            size="md"
                          />
                        )}
                      </td>
                      <td className="py-2 px-1">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handleEdit(payment)}
                            className="text-dark-500 hover:text-primary-600 transition-colors"
                            aria-label="Edit payment"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          {showDeleteConfirm === payment.payment_id ? (
                            <div className="flex items-center">
                              <button
                                className="text-dark-500 hover:text-status-success transition-colors"
                                onClick={() => handleDelete(payment.payment_id)}
                                disabled={deletePaymentMutation.isLoading}
                                aria-label="Confirm delete"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                              <button
                                className="text-dark-500 hover:text-dark-700 ml-1 transition-colors"
                                onClick={() => setShowDeleteConfirm(null)}
                                aria-label="Cancel delete"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(payment.payment_id)}
                              className="text-dark-500 hover:text-status-error transition-colors"
                              aria-label="Delete payment"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {expandedPaymentId === payment.payment_id && payment.is_split_payment && (
                      <tr>
                        <td className="py-0"></td>
                        <td colSpan="8" className="py-0">
                          <div className="bg-light-200 p-2 my-1 rounded-md">
                            <h4 className="text-sm font-medium text-dark-700 mb-2">
                              Payment Distribution
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {payment.periods?.map((period, i) => (
                                <div
                                  key={i}
                                  className="bg-white p-2 rounded border border-light-300 shadow-sm"
                                >
                                  <div className="text-xs text-dark-500">
                                    {period.period}
                                  </div>
                                  <div className="text-sm font-medium">
                                    {formatCurrency(period.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-2 bg-light-200 border-t border-light-300">
            <div className="text-sm text-dark-500">
              Showing {payments.length} payments
            </div>
            <nav className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1 || isPreviousData}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (payments.length === 10 && !isPreviousData) {
                    setPage(page + 1);
                  }
                }}
                disabled={payments.length < 10 || isPreviousData}
              >
                Next
              </Button>
            </nav>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-dark-800 bg-opacity-75 flex items-center justify-center z-50">
          <Card className="max-w-md w-full" elevation="default">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-2 text-dark-700">Confirm Delete</h3>
              <p className="mb-3 text-dark-500">
                Are you sure you want to delete this payment? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletePaymentMutation.isLoading}
                >
                  {deletePaymentMutation.isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

function formatAppliedPeriod(payment) {
  if (payment.applied_start_quarter) {
    return `Q${payment.applied_start_quarter} ${payment.applied_start_quarter_year}`;
  }
  
  if (payment.applied_start_month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = monthNames[payment.applied_start_month - 1];
    return `${monthName} ${payment.applied_start_month_year}`;
  }
  
  return 'N/A';
}

export default PaymentHistory;