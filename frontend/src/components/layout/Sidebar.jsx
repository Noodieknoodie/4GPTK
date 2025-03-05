import React, { useState } from 'react';
import useStore from '../../store';
import ClientSearch from '../client/ClientSearch';

const Sidebar = ({ clients = [], isLoading = false }) => {
  const { selectedClientId, setSelectedClientId } = useStore();
  const [showByProvider, setShowByProvider] = useState(false);
  
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
        <div className="flex items-center justify-between">
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
                className={`w-full justify-start py-2 px-3 mb-1 text-left rounded transition-colors ${
                  selectedClientId === client.client_id 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedClientId(client.client_id)}
              >
                <div className="flex items-center w-full">
                  <span className="mr-3">
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
                      className={
                        client.compliance_status === 'green' 
                          ? 'text-green-500' 
                          : client.compliance_status === 'yellow' 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                      }
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <span className="truncate flex-grow">{client.display_name}</span>
                </div>
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