import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DocumentViewer from '../payment/DocumentViewer';
import useStore from '../../store';

const PageLayout = ({ children, clients = [], isLoading = false }) => {
  const { documentViewerOpen } = useStore();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar clients={clients} isLoading={isLoading} />
        
        <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 overflow-auto p-6 ${documentViewerOpen ? 'w-3/5' : 'w-full'}`}>
            {children}
          </div>
          
          <DocumentViewer />
        </div>
      </div>
    </div>
  );
};

export default PageLayout;