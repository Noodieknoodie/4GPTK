import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const LaunchMenu = () => {
  const router = useRouter();

  const handleNavigation = (path) => {
    if (path === '/payments') {
      router.push('/payments');
    } else {
      router.push('/under-construction', { 
        query: { feature: path.replace('/', '') } 
      });
    }
  };

  const modules = [
    {
      id: 'payments',
      title: '401k Payments Manager',
      description: 'Manage and Review Client 401k payments',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      ),
      path: '/payments'
    },
    {
      id: 'agenda',
      title: 'Agenda Generator',
      description: 'Create and manage meeting agendas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
      ),
      path: '/agenda'
    },
    {
      id: 'efip',
      title: 'eFIP',
      description: 'Financial Independence Projections',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"></line>
          <line x1="18" y1="20" x2="18" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="16"></line>
        </svg>
      ),
      path: '/efip'
    },
    {
      id: 'structured-notes',
      title: 'Structured Notes Tracker',
      description: 'GBIL, Cash, and Structured Notes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
        </svg>
      ),
      path: '/structured-notes'
    },
    {
      id: 'ai-tools',
      title: 'AI Tools',
      description: 'AI-powered investment analysis',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
          <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
          <path d="M12 12l9.2-7.4"></path>
          <path d="M12 12V2"></path>
        </svg>
      ),
      path: '/ai-tools'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>HohimerPro</title>
      </Head>
      
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to HohimerPro</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Investment management suite for Hohimer Wealth Management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleNavigation(module.path)}
              className="bg-white border border-gray-200 hover:border-blue-500 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left flex items-start gap-4"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                {module.icon}
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">{module.title}</h2>
                <p className="text-gray-500">{module.description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Hohimer Wealth Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LaunchMenu;