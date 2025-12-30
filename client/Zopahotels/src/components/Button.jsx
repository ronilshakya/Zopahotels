import React from 'react';

const Button = ({ children, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${disabled 
          ? "bg-gray-400 hover:bg-gray-400 text-gray-200 cursor-not-allowed" 
          : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"}`}
    >
      {children}
    </button>
  );
};

export default Button;