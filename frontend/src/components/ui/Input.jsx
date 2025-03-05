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
        <label className="text-sm font-medium flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
            w-full h-10 rounded-md border
            ${error ? 'border-red-500' : 'border-gray-200'}
            ${prefix ? 'pl-8' : 'pl-3'}
            ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${className}
          `}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default Input;