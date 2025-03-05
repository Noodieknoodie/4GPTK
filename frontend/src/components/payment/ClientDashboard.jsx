import React from 'react';
import ContractCard from './ContractCard';
import PaymentInfoCard from './PaymentInfoCard';
import ComplianceCard from './ComplianceCard';
import { useClient, useClientContract, useClientSummary } from '../../hooks/useClientData';

const ClientDashboard = ({ clientId }) => {
  const {
    data: client,
    isLoading: isClientLoading,
    error: clientError,
  } = useClient(clientId);
  
  const {
    data: contract,
    isLoading: isContractLoading,
    error: contractError,
  } = useClientContract(clientId);
  
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useClientSummary(clientId);
  
  const isLoading = isClientLoading || isContractLoading || isSummaryLoading;
  const error = clientError || contractError || summaryError;
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading client information: {error.message}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ContractCard 
          contract={contract} 
          isLoading={isContractLoading} 
        />
        
        <PaymentInfoCard 
          client={client}
          contract={contract}
          metrics={summary?.metrics}
          isLoading={isLoading}
        />
        
        <ComplianceCard 
          client={client}
          contract={contract}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ClientDashboard;