import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';

const SummaryPage = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Summary</h1>
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Page Under Construction
          </h2>
          <p className="text-gray-500 mb-6">
            The Summary page is currently being developed. Please check back later.
          </p>
        </div>
      </Card>
    </PageLayout>
  );
};

export default SummaryPage;