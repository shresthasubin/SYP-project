import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-400">{label}</label>}
      <input
        className={`bg-dark-bg border ${error ? 'border-neon-red' : 'border-gray-700 focus:border-neon-blue'} rounded-lg px-4 py-2.5 text-white outline-none transition-colors placeholder:text-gray-600`}
        {...props}
      />
      {error && <span className="text-xs text-neon-red">{error}</span>}
    </div>
  );
};

export default Input;
