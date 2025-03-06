import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/feeUtils';
import { formatDate, getNextPaymentDate } from '../../lib/dateUtils';

const PaymentInfoCard = ({ client, contract, metrics, isLoading }) => {
  if (isLoading) {
    return (
      <Card variant="default" elevation="default">
        <div className="pb-2">
          <h3 className="text-base font-semibold text-dark-700 border-b border-light-300 pb-2">Payment Information</h3>
        </div>
        <div className="animate-pulse mt-3">
          <div className="grid grid-cols-1 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between py-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const calculateExpectedFee = () => {
    if (!contract) return 'N/A';
    
    if (contract.fee_type === 'flat') {
      return formatCurrency(contract.flat_rate);
    }
    
    if (metrics?.last_recorded_assets && contract.percent_rate) {
      return formatCurrency(metrics.last_recorded_assets * contract.percent_rate);
    }
    
    if (metrics?.last_payment_amount) {
      return formatCurrency(metrics.last_payment_amount);
    }
    
    return 'N/A';
  };
  
  const nextPaymentDate = contract && metrics?.last_payment_date
    ? formatDate(getNextPaymentDate(metrics.last_payment_date, contract.payment_schedule))
    : 'N/A';

  const details = [
    {
      label: 'AUM',
      value: metrics?.last_recorded_assets 
        ? formatCurrency(metrics.last_recorded_assets) 
        : 'No AUM data available',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      label: 'Expected Fee',
      value: calculateExpectedFee(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      )
    },
    {
      label: 'Last Payment',
      value: metrics?.last_payment_date ? formatDate(metrics.last_payment_date) : 'N/A',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )
    },
    {
      label: 'Last Payment Amount',
      value: metrics?.last_payment_amount ? formatCurrency(metrics.last_payment_amount) : 'N/A',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      label: 'Next Payment Due',
      value: nextPaymentDate,
      highlight: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
  ];

  return (
    <Card variant="default" elevation="default">
      <div className="pb-2">
        <h3 className="text-base font-semibold text-dark-700 border-b border-light-300 pb-2">Payment Information</h3>
      </div>
      <dl className="grid grid-cols-1 gap-2 text-sm mt-4">
        {details.map((item, idx) => (
          <div 
            key={idx} 
            className={`
              flex justify-between items-center py-1.5 px-2 -mx-2 rounded
              ${item.highlight ? 'bg-light-200 border border-light-400' : ''}
            `}
          >
            <dt className="text-dark-500 flex items-center gap-2">
              {item.icon}
              {item.label}
            </dt>
            <dd className={`font-medium ${item.highlight ? 'text-primary-600' : 'text-dark-700'}`}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};

export default PaymentInfoCard;