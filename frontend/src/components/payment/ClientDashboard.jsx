import React from 'react';
import ContractCard from './ContractCard';
import PaymentInfoCard from './PaymentInfoCard';
import ComplianceCard from './ComplianceCard';
import { useClient, useClientContract, useClientSummary } from '../../hooks/useClientData';
import useStore from '../../store';

const ClientDashboard = ({ clientId }) => {
  const { documentViewerOpen } = useStore();
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
  
  // Determine layout based on document viewer state
  const cardLayoutClass = documentViewerOpen 
    ? "grid grid-cols-1 lg:grid-cols-2 gap-6" 
    : "grid grid-cols-1 md:grid-cols-3 gap-6";
  
  return (
    <div className="space-y-6">
      <div className={cardLayoutClass}>
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
        
        {/* When document viewer is open and on smaller screens, this card moves below */}
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