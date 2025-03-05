import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/feeUtils';
import { formatDate, getNextPaymentDate } from '../../lib/dateUtils';

const PaymentInfoCard = ({ client, contract, metrics, isLoading }) => {
  if (isLoading) {
    return (
      <Card title="Payment Information">
        <div className="animate-pulse">
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
    },
    {
      label: 'Expected Fee',
      value: calculateExpectedFee(),
    },
    {
      label: 'Last Payment',
      value: metrics?.last_payment_date ? formatDate(metrics.last_payment_date) : 'N/A',
    },
    {
      label: 'Last Payment Amount',
      value: metrics?.last_payment_amount ? formatCurrency(metrics.last_payment_amount) : 'N/A',
    },
    {
      label: 'Next Payment Due',
      value: nextPaymentDate,
    },
  ];

  return (
    <Card>
      <div className="pb-2">
        <h3 className="text-sm font-bold text-gray-800">Payment Information</h3>
      </div>
      <dl className="grid grid-cols-1 gap-1 text-sm">
        {details.map((item, idx) => (
          <div key={idx} className="flex justify-between py-1">
            <dt className="text-gray-500">{item.label}</dt>
            <dd className="font-medium text-gray-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};

export default PaymentInfoCard;