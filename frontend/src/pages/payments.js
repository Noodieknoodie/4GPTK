import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '../components/layout/PageLayout';
import ClientDashboard from '../components/payment/ClientDashboard';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentHistory from '../components/payment/PaymentHistory';
import api from '../lib/api';
import useStore from '../store';

const PaymentsPage = () => {
  const { selectedClientId, setSelectedClientId, documentViewerOpen, setDocumentViewerOpen } = useStore();
  const [apiHealthy, setApiHealthy] = useState(true);

  useEffect(() => {
    // Check API health when component mounts
    const checkHealth = async () => {
      const isHealthy = await api.health();
      setApiHealthy(isHealthy);
    };
    checkHealth();
  }, []);
  
  const { 
    data: clients = [], 
    isLoading,
    error,
  } = useQuery(['clients'], () => api.getClients(), {
    enabled: apiHealthy, // Only run if API is healthy
    retry: 2,
    onError: () => setApiHealthy(false)
  });
  
  // If no client is selected, select the first one automatically
  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].client_id);
    }
  }, [clients, selectedClientId, setSelectedClientId]);
  
  const toggleDocumentViewer = () => {
    setDocumentViewerOpen(!documentViewerOpen);
  };
  
  const renderContent = () => {
    // Show API connectivity error if the backend is down
    if (!apiHealthy) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Cannot Connect to Server</h3>
          <p className="mb-4">Unable to establish connection with the backend server. Please make sure the backend is running.</p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={async () => {
              const isHealthy = await api.health();
              setApiHealthy(isHealthy);
            }}
          >
            Retry Connection
          </button>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading clients: {error.message}
        </div>
      );
    }
    
    if (!selectedClientId) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-center text-gray-500">
            {clients.length > 0 
              ? 'Select a client from the sidebar to view payment information.'
              : 'No clients available. Please add clients to the system.'}
          </p>
        </div>
      );
    }
    
    const client = clients.find(c => c.client_id === selectedClientId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isLoading ? 'Loading...' : client?.display_name || 'Client Company Name'}
          </h1>
          <button 
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md"
            onClick={toggleDocumentViewer}
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
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {documentViewerOpen ? "Hide Documents" : "View Documents"}
          </button>
        </div>
        
        <ClientDashboard clientId={selectedClientId} />
        
        <PaymentForm clientId={selectedClientId} />
        
        <PaymentHistory clientId={selectedClientId} />
      </div>
    );
  };
  
  return (
    <PageLayout clients={clients} isLoading={isLoading}>
      {renderContent()}
    </PageLayout>
  );
};

export default PaymentsPage;