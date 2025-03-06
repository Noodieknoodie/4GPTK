import React from 'react';
import useStore from '../../store';

const DocumentViewer = () => {
  const { documentViewerOpen, setDocumentViewerOpen, selectedDocumentUrl } = useStore();
  
  if (!documentViewerOpen) {
    return null;
  }
  
  return (
    <div className="w-2/5 border-l border-gray-200 bg-white flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Document Preview</h2>
        <div className="flex items-center space-x-2">
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
            title="Close"
            onClick={() => setDocumentViewerOpen(false)}
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-grow p-4">
        <div className="bg-gray-100 rounded-md p-4 h-full flex items-center justify-center">
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mx-auto mb-4 text-gray-400"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p className="text-sm text-gray-500 mb-4">Document viewer functionality will be implemented in a future update</p>
            <p className="text-xs text-gray-400 mb-4">This component will display client payment documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;