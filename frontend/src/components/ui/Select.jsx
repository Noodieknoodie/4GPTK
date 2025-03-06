import React from 'react';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  error = null,
  className = '',
  size = 'default',
}) => {
  const sizeStyles = {
    sm: 'h-8 px-2 text-sm',
    default: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-sm font-medium text-dark-600 flex items-center">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      <div className="relative w-full group">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full rounded-md appearance-none shadow-sm
            ${sizeStyles[size] || sizeStyles.default}
            transition-all duration-200 ease-in-out
            ${error ? 'border-status-error' : 'border-light-400 group-hover:border-light-500'}
            ${disabled ? 'bg-light-300 text-dark-400 cursor-not-allowed' : 'bg-light-100 text-dark-600'}
            focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
            className="text-dark-400 group-hover:text-dark-500 transition-colors duration-200"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        {!error && !disabled && (
          <div className="absolute inset-0 border border-transparent rounded-md pointer-events-none group-hover:border-light-400 transition-all duration-200"></div>
        )}
      </div>
      {error && (
        <p className="text-status-error text-xs mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default Select;