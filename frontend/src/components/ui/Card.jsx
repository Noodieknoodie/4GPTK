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
  const variantStyles = {
    default: 'bg-white border-l-4 border-light-400',
    purple: 'bg-white border-l-4 border-primary-600',
    accent: 'bg-primary-50 border-b-2 border-primary-300',
    dark: 'bg-dark-card text-light-300 border-l-4 border-dark-accent',
    premium: 'bg-white border-l-4 border-primary-400',
  };

  const sizeStyles = {
    sm: 'p-3',
    default: 'p-5',
    lg: 'p-6',
  };

  const elevationStyles = {
    flat: 'shadow-sm',
    default: 'shadow-card',
    raised: 'shadow-md',
  };

  return (
    <div 
      className={`
        ${variantStyles[variant] || variantStyles.default} 
        ${elevationStyles[elevation] || elevationStyles.default}
        rounded-lg
        ${className}
      `} 
      {...props}
    >
      {title && (
        <div className={`px-5 py-4 border-b border-light-400 font-medium ${titleClassName}`}>
          <h3 className="text-lg">{title}</h3>
        </div>
      )}
      <div className={`${sizeStyles[size] || sizeStyles.default} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;