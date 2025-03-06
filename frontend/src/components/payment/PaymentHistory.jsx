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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-dark-700">Payment History</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-dark-500">Filter by Year:</label>
          <select
            className="border border-light-500 rounded-md text-sm p-1.5 bg-white shadow-sm"
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
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-light-300 border border-light-400 p-6 rounded-lg text-center text-dark-500">
          No payment records found.
        </div>
      ) : (
        <Card className="p-0 overflow-hidden" elevation="default">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead>
                <tr>
                  <th className="w-[4%]"></th>
                  <th className="w-[12%]">Received Date</th>
                  <th className="w-[12%]">Provider</th>
                  <th className="w-[12%]">Applied Period</th>
                  <th className="w-[12%]">AUM</th>
                  <th className="w-[12%]">Expected Fee</th>
                  <th className="w-[12%]">Amount</th>
                  <th className="w-[12%]">Variance</th>
                  <th className="w-[12%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <React.Fragment key={payment.payment_id}>
                    <tr>
                      <td>
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
                      <td>{formatDate(payment.received_date)}</td>
                      <td>{payment.provider_name || 'N/A'}</td>
                      <td>
                        {payment.is_split_payment ? (
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs rounded bg-light-300 text-dark-600">Split</span>
                            <span className="ml-2 text-dark-500">
                              {payment.periods?.length || 0} periods
                            </span>
                          </div>
                        ) : formatAppliedPeriod(payment)}
                      </td>
                      <td>
                        {payment.total_assets ? formatCurrency(payment.total_assets) : 'N/A'}
                      </td>
                      <td>
                        {payment.expected_fee ? formatCurrency(payment.expected_fee) : 'N/A'}
                      </td>
                      <td className="font-medium">{formatCurrency(payment.actual_fee)}</td>
                      <td>
                        {payment.variance?.status && (
                          <StatusBadge
                            status={payment.variance.status}
                            label={payment.variance.message}
                          />
                        )}
                      </td>
                      <td>
                        <div className="flex justify-center space-x-3">
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
                        <td></td>
                        <td colSpan="8">
                          <div className="bg-light-300 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-dark-700 mb-2">
                              Payment Distribution
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {payment.periods?.map((period, i) => (
                                <div
                                  key={i}
                                  className="bg-light-100 p-2 rounded border border-light-400"
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
          <div className="flex items-center justify-between px-5 py-3 bg-light-200 border-t border-light-400">
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
          <Card className="max-w-md w-full" elevation="raised">
            <div className="p-5">
              <h3 className="text-lg font-medium mb-3 text-dark-700">Confirm Delete</h3>
              <p className="mb-4 text-dark-500">
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