import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/feeUtils';
import { generateFeeReferences } from '../../lib/feeUtils';

const ComplianceCard = ({ client, contract, isLoading }) => {
  if (isLoading) {
    return (
      <Card variant="default" elevation="default">
        <div className="pb-2">
          <h3 className="text-base font-semibold text-dark-700 border-b border-light-300 pb-2">Compliance Status</h3>
        </div>
        <div className="animate-pulse flex flex-col md:flex-row gap-4 mt-3">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
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
    return 'Payment Overdue';
  };
  
  const getStatusBgColor = () => {
    if (status === 'green') return 'bg-green-50 border-green-200 text-green-700';
    if (status === 'yellow') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-red-50 border-red-200 text-red-700';
  };
  
  const feeReferences = contract ? generateFeeReferences(contract) : null;

  return (
    <Card variant="default" elevation="default">
      <div className="pb-2">
        <h3 className="text-base font-semibold text-dark-700 border-b border-light-300 pb-2">Payment Status</h3>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex-1">
          <div className={`flex items-center gap-3 p-3 rounded border ${getStatusBgColor()}`}>
            <StatusIcon />
            <span className="font-medium">{getStatusText()}</span>
          </div>
          
          {/* Simplified contract info */}
          {contract && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-dark-500">
                <span className="font-medium">Schedule:</span> {contract.payment_schedule === 'monthly' ? 'Monthly' : 'Quarterly'}
              </div>
              <div className="text-dark-500">
                <span className="font-medium">Fee Type:</span> {contract.fee_type === 'flat' ? 'Flat' : 'Percentage'}
              </div>
            </div>
          )}
        </div>
        
        {/* Fee reference is now more compact */}
        {feeReferences && (
          <div className="mt-2 border-t border-light-300 pt-3">
            <h4 className="text-sm font-medium text-dark-600 mb-2">Fee Reference</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-light-200 p-2 rounded text-center">
                <div className="text-xs text-dark-500">Monthly</div>
                <div className="font-medium text-dark-700">{feeReferences.monthly}</div>
              </div>
              <div className="bg-light-200 p-2 rounded text-center">
                <div className="text-xs text-dark-500">Quarterly</div>
                <div className="font-medium text-dark-700">{feeReferences.quarterly}</div>
              </div>
              <div className="bg-light-200 p-2 rounded text-center">
                <div className="text-xs text-dark-500">Annual</div>
                <div className="font-medium text-dark-700">{feeReferences.annual}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ComplianceCard;