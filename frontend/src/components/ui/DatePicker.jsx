import React from 'react';

const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = '',
  disabled = false,
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
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full h-10 pl-8 pr-3 border rounded-md
            ${error ? 'border-red-500' : 'border-gray-200'}
            ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          `}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
            className="text-gray-400"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default DatePicker;