import React from 'react';

const StatusBadge = ({ status, label, size = 'md' }) => {
  const colorVariants = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    
    exact: 'bg-blue-100 text-blue-800',
    acceptable: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    alert: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-800',
  };
  
  const sizeClasses = {
    xs: 'px-1 py-0.5 text-xs',
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  const colorClass = colorVariants[status] || colorVariants.gray;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Super simplified variance label formatting
  const getSimpleLabel = () => {
    // Check for missing AUM data or cannot calculate scenario
    if (label && typeof label === 'string' && 
        (label.toLowerCase().includes('cannot calculate') || 
         label.toLowerCase().includes('no aum'))) {
      return "Missing AUM data";
    }
    
    // For exact matches, show a simple checkmark and text
    if (status === 'exact') {
      return (
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Exact
        </span>
      );
    }
    
    // For acceptable variances, just show "Within range"
    if (status === 'acceptable') {
      return "Within range";
    }
    
    // For warnings and alerts, extract the dollar amount and show a clear message
    if ((status === 'warning' || status === 'alert') && label && typeof label === 'string') {
      const dollarMatch = label.match(/\$([-+]?[0-9,]+(\.[0-9]{2})?)/);
      if (dollarMatch) {
        const amount = dollarMatch[0].replace('-', ''); // Remove negative sign
        // Determine if it's over or under payment from the raw amount
        const isOver = !label.includes('-');
        return isOver ? `Overpaid ${amount}` : `Underpaid ${amount}`;
      }
    }
    
    // Default fallback
    return label || 'Unknown';
  };
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClass}`}>
      {getSimpleLabel()}
    </span>
  );
};

export default StatusBadge;