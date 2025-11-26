import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-card-bg border border-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;
