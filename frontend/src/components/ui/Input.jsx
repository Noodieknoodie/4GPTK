import React from 'react';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  prefix = null,
  disabled = false,
  className = '',
  required = false,
  error = null,
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium flex items-center text-dark-600">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-primary-500 transition-colors duration-200">
            {prefix}
          </div>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full h-10 rounded-md border shadow-sm
            ${error ? 'border-red-500' : 'border-gray-200 group-hover:border-primary-300'}
            ${prefix ? 'pl-8' : 'pl-3'}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
            transition-all duration-200 ease-in-out
            ${className}
          `}
        />
        {!error && !disabled && (
          <div className="absolute inset-0 border border-transparent rounded-md pointer-events-none group-hover:border-primary-200 group-hover:shadow-sm transition-all duration-200"></div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;