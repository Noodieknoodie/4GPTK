import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  iconLeft = null,
  iconRight = null,
  ...props 
}) => {
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-sm shadow-sm',
    secondary: 'bg-white border border-light-500 text-dark-500 hover:bg-light-200 hover:border-light-500 hover:text-dark-600 shadow-sm',
    outline: 'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 hover:text-primary-700 shadow-sm',
    dark: 'bg-dark-600 text-white hover:bg-dark-700 hover:shadow-sm shadow-sm',
    ghost: 'text-dark-500 hover:bg-light-300 hover:text-dark-600',
    danger: 'bg-status-error text-white hover:bg-red-700 hover:shadow-sm shadow-sm',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={`
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        flex items-center justify-center gap-2
        rounded-md font-medium 
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500
        ${className}
      `}
      {...props}
    >
      {iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;