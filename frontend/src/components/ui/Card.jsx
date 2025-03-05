import React from 'react';

const Card = ({ 
  children, 
  title,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  ...props 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`} {...props}>
      {title && (
        <div className={`px-4 py-2 border-b border-gray-200 ${titleClassName}`}>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;