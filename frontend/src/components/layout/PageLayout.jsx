import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DocumentViewer from '../payment/DocumentViewer';
import useStore from '../../store';

const PageLayout = ({ children, clients = [], isLoading = false }) => {
  const { documentViewerOpen } = useStore();
  
  return (
    <div className="flex flex-col min-h-screen bg-light-200">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar clients={clients} isLoading={isLoading} />
        
        <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 overflow-auto px-5 py-6 ${documentViewerOpen ? 'w-3/5' : 'w-full'}`}>
            <div className={`mx-auto ${documentViewerOpen ? 'max-w-full' : 'max-w-full'}`}>
              {children}
            </div>
          </div>
          
          <DocumentViewer />
        </div>
      </div>
    </div>
  );
};

export default PageLayout;