import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/feeUtils';

const ContractCard = ({ contract, isLoading }) => {
  if (isLoading) {
    return (
      <Card 
        variant="default"
        elevation="default"
      >
        <div className="pb-2">
          <h3 className="text-base font-semibold text-dark-700 border-b border-light-300 pb-2">Contract Details</h3>
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

  if (!contract) {
    return (
      <Card 
        variant="default"
        elevation="default"
      >
        <div className="pb-2">
          <h3 className="text-base font-semibold text-dark-700 border-b border-light-300 pb-2">Contract Details</h3>
        </div>
        <div className="py-6 text-center text-gray-500">
          No contract information available
        </div>
      </Card>
    );
  }

  const details = [
    {
      label: 'Contract Number',
      value: contract.contract_number || 'N/A',
    },
    {
      label: 'Plan Provider',
      value: contract.provider_name,
    },
    {
      label: 'Payment Frequency',
      value: contract.payment_schedule === 'monthly' ? 'Monthly' : 'Quarterly',
    },
    {
      label: 'Fee Structure',
      value: contract.fee_type === 'flat' ? 'Flat Rate' : 'Percentage of AUM',
    },
    {
      label: 'Fee Amount',
      value:
        contract.fee_type === 'flat'
          ? formatCurrency(contract.flat_rate)
          : `${(contract.percent_rate * 100).toFixed(3)}%`,
    },
  ];

  return (
    <Card variant="default" elevation="default">
      <div className="pb-2">
        <h3 className="text-base font-semibold text-dark-700 border-b border-light-300 pb-2">Contract Details</h3>
      </div>
      <dl className="grid grid-cols-1 gap-2 text-sm mt-4">
        {details.map((item, idx) => (
          <div key={idx} className="flex justify-between py-1.5 px-2 -mx-2 rounded">
            <dt className="text-dark-500">{item.label}</dt>
            <dd className="font-medium text-dark-700">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};

export default ContractCard;