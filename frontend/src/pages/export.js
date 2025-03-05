import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';

const ExportPage = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Export Data</h1>
      </div>
      
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Page Under Construction
          </h2>
          <p className="text-gray-500 mb-6">
            The Export Data page is currently being developed. Please check back later.
          </p>
        </div>
      </Card>
    </PageLayout>
  );
};

export default ExportPage;