import React, { useState } from 'react';
import useStore from '../../store';
import ClientSearch from '../client/ClientSearch';
import { useRouter } from 'next/router';

const Sidebar = ({ clients = [], isLoading = false }) => {
  const { selectedClientId, setSelectedClientId } = useStore();
  const [showByProvider, setShowByProvider] = useState(false);
  const router = useRouter();
  
  // Group clients by provider
  const groupClientsByProvider = () => {
    if (!showByProvider) {
      return [['All', clients]];
    }
    
    return Object.entries(
      clients.reduce((acc, client) => {
        const provider = client.provider_name || 'No Provider';
        if (!acc[provider]) acc[provider] = [];
        acc[provider].push(client);
        return acc;
      }, {})
    ).sort((a, b) => a[0].localeCompare(b[0]));
  };
  
  const groupedClients = groupClientsByProvider();
  
  // Get the status icon based on compliance status
  const StatusIcon = ({ status }) => {
    if (status === 'green') {
      return (
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
          className="text-green-500"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    } else if (status === 'yellow') {
      return (
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
          className="text-yellow-500"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    } else {
      return (
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
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Clients</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="p-2 flex-1 overflow-auto">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Clients</h2>
        <ClientSearch clients={clients} isLoading={isLoading} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-medium text-gray-700">View by Provider</span>
          <button 
            className={`h-5 w-10 rounded-full relative ${showByProvider ? 'bg-blue-600' : 'bg-gray-200'}`}
            onClick={() => setShowByProvider(!showByProvider)}
          >
            <div 
              className={`absolute w-3 h-3 rounded-full bg-white top-1 transition-all ${
                showByProvider ? 'right-1' : 'left-1'
              }`}
            ></div>
          </button>
        </div>
      </div>
      <div className="p-2 flex-1 overflow-auto">
        {groupedClients.map(([provider, providerClients]) => (
          <div key={provider} className="mb-2">
            {showByProvider && (
              <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-md mb-1">
                {provider}
              </div>
            )}
            {providerClients.map(client => (
              <button
                key={client.client_id}
                className={`w-full flex items-center py-2 px-3 mb-1 text-left rounded transition-colors ${
                  selectedClientId === client.client_id 
                    ? 'bg-gray-100 border-l-4 border-primary-600 font-medium text-dark-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedClientId(client.client_id)}
              >
                <span className="truncate flex-grow">{client.display_name}</span>
                <span className="ml-2 flex-shrink-0">
                  <StatusIcon status={client.compliance_status} />
                </span>
              </button>
            ))}
          </div>
        ))}
        
        {clients.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No clients available
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;