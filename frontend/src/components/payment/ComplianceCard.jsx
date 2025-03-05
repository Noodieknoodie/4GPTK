import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/feeUtils';
import { generateFeeReferences } from '../../lib/feeUtils';

const ComplianceCard = ({ client, contract, isLoading }) => {
  if (isLoading) {
    return (
      <Card title="Compliance Status">
        <div className="animate-pulse flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="md:w-2/5">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const status = client?.compliance_status || 'red';
  const reason = client?.compliance_reason || 'No compliance data available';
  
  const StatusIcon = () => {
    if (status === 'green') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    }
    
    if (status === 'yellow') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    }
    
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    );
  };
  
  const getStatusText = () => {
    if (status === 'green') return 'Compliant';
    if (status === 'yellow') return 'Attention Needed';
    return 'Non-Compliant';
  };
  
  const getStatusColor = () => {
    if (status === 'green') return 'text-green-700';
    if (status === 'yellow') return 'text-yellow-700';
    return 'text-red-700';
  };
  
  const feeReferences = contract ? generateFeeReferences(contract) : null;

  return (
    <Card>
      <div className="pb-2">
        <h3 className="text-sm font-bold text-gray-800">Compliance Status</h3>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <StatusIcon />
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {contract && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="text-sm text-gray-600">
                  {contract.payment_schedule === 'monthly' ? 'Monthly' : 'Quarterly'} payment schedule
                </span>
              </div>
            )}
            {contract && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                <span className="text-sm text-gray-600">
                  {contract.fee_type === 'flat' 
                    ? `Flat fee of ${formatCurrency(contract.flat_rate)}`
                    : `Percentage fee of ${(contract.percent_rate * 100).toFixed(4)}%`}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {feeReferences && (
          <div className="md:w-2/5">
            <div className="bg-gray-50 rounded-md p-3">
              <h4 className="text-xs font-medium text-gray-500 mb-2">Fee Reference</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Monthly:</span>
                  <span className="font-medium ml-1">{feeReferences.monthly}</span>
                </div>
                <div>
                  <span className="text-gray-500">Quarterly:</span>
                  <span className="font-medium ml-1">{feeReferences.quarterly}</span>
                </div>
                <div>
                  <span className="text-gray-500">Annually:</span>
                  <span className="font-medium ml-1">{feeReferences.annual}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ComplianceCard;