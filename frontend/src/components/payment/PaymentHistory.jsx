import React, { useState } from 'react';
import { usePaymentHistory, useDeletePayment } from '../../hooks/usePaymentData';
import { formatDate } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/feeUtils';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import useStore from '../../store';

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Filter by Year:</label>
          <select
            className="border border-gray-200 rounded-md text-sm p-1"
            value={year || ''}
            onChange={(e) => {
              setYear(e.target.value ? Number(e.target.value) : null);
              setPage(1);
            }}
          >
            <option value="">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[5%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  <th className="w-[11.875%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
                  <th className="w-[11.875%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="w-[11.875%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Period</th>
                  <th className="w-[11.875%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AUM</th>
                  <th className="w-[11.875%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Fee</th>
                  <th className="w-[11.875%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="w-[11.875%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                  <th className="w-[11.875%] px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <React.Fragment key={payment.payment_id}>
                    <tr className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-4">
                        {payment.is_split_payment && (
                          <button
                            className="w-6 h-6 flex items-center justify-center"
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
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800 truncate">
                        {formatDate(payment.received_date)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800 truncate">
                        {payment.provider_name || 'N/A'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800 truncate">
                        {payment.is_split_payment ? (
                          <div className="flex items-center">
                            <StatusBadge label="Split" status="blue" />
                            <span className="ml-2 text-gray-500">
                              {payment.periods?.length || 0} periods
                            </span>
                          </div>
                        ) : (
                          formatAppliedPeriod(payment)
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800 truncate">
                        {payment.total_assets
                          ? formatCurrency(payment.total_assets)
                          : 'N/A'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800 truncate">
                        {payment.expected_fee
                          ? formatCurrency(payment.expected_fee)
                          : 'N/A'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800 font-medium truncate">
                        {formatCurrency(payment.actual_fee)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap truncate">
                        {payment.variance?.status && (
                          <StatusBadge
                            label={payment.variance.message}
                            status={payment.variance.status}
                          />
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center space-x-3">
                          {/* Edit Icon */}
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors" 
                            onClick={() => handleEdit(payment)}
                            title="Edit payment"
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
                          
                          {/* Delete Icon */}
                          {showDeleteConfirm === payment.payment_id ? (
                            <div className="flex items-center">
                              <button
                                className="text-green-600 hover:text-green-800 transition-colors"
                                onClick={() => handleDelete(payment.payment_id)}
                                disabled={deletePaymentMutation.isLoading}
                                title="Confirm delete"
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
                                className="text-gray-600 hover:text-gray-800 ml-1 transition-colors"
                                onClick={() => setShowDeleteConfirm(null)}
                                title="Cancel delete"
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
                              className="text-red-600 hover:text-red-800 transition-colors"
                              onClick={() => setShowDeleteConfirm(payment.payment_id)}
                              title="Delete payment"
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
                      <tr className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-2"></td>
                        <td colSpan="8" className="px-3 py-3">
                          <div className="bg-gray-100 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Payment Distribution
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {payment.periods?.map((period, i) => (
                                <div
                                  key={i}
                                  className="bg-white p-2 rounded border border-gray-200"
                                >
                                  <div className="text-xs text-gray-500">
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
        )}
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || isLoading}
              size="sm"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={payments.length < 10 || isLoading || isPreviousData}
              size="sm"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="secondary"
                  onClick={() => setPage(1)}
                  disabled={page === 1 || isLoading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium"
                >
                  &lt;&lt;
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || isLoading}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium"
                >
                  &lt;
                </Button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700">
                  Page {page}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={payments.length < 10 || isLoading || isPreviousData}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium"
                >
                  &gt;
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
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