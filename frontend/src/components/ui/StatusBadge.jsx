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
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  const colorClass = colorVariants[status] || colorVariants.gray;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  );
};

export default StatusBadge;