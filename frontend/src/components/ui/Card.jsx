import React from 'react';

const Card = ({ 
  children, 
  title,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  variant = 'default',
  size = 'default',
  elevation = 'default',
  ...props 
}) => {
  const elevationClasses = {
    none: '',
    default: 'shadow-sm',
    raised: 'shadow-md',
    floating: 'shadow-lg',
  };

  const variantClasses = {
    default: 'bg-white border border-light-300',
    outlined: 'bg-white border border-light-300',
    filled: 'bg-light-100 border border-light-200',
  };

  // Default to p-3 (smaller than before) if no padding class is specified in className
  const hasPaddingClass = /\bp-\d+\b/.test(className);
  const paddingClass = hasPaddingClass ? '' : 'p-3';

  const baseClasses = 'rounded-lg';
  const elevationClass = elevationClasses[elevation] || elevationClasses.default;
  const variantClass = variantClasses[variant] || variantClasses.default;

  return (
    <div 
      className={`${baseClasses} ${elevationClass} ${variantClass} ${paddingClass} ${className}`}
      {...props}
    >
      {title && (
        <div className={`px-5 py-4 border-b border-light-400 font-medium ${titleClassName}`}>
          <h3 className="text-lg">{title}</h3>
        </div>
      )}
      <div className={`${size} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;