import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center space-x-2 text-xl font-bold logo-wrapper"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg logo-gradient text-white shadow-lg transform transition-transform hover:scale-105">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6"
        >
          <path d="M11 3V7C11 8.11 10.1 9 9 9H5C3.9 9 3 8.11 3 7V3H2V7C2 8.66 3.34 10 5 10H9C10.66 10 12 8.66 12 7V3H11Z"/>
          <path d="M19.34 3.77C19.71 2.51 19 1 17.5 1C16.67 1 16 1.67 16 2.5V7H14V2.5C14 1.67 13.33 1 12.5 1C11 1 10.29 2.51 10.66 3.77L11.86 8.11C11.95 8.43 12.24 8.64 12.56 8.64H17.44C17.76 8.64 18.05 8.43 18.14 8.11L19.34 3.77Z"/>
          <path d="M11 3H9C6.79 3 5 4.79 5 7v1h6V7c0-2.21-1.79-4-4-4zm8 11v-4c0-2.21-1.79-4-4-4S11 7.79 11 10v4h8zm-4-12c-3.31 0-6 2.69-6 6v4h12v-4c0-3.31-2.69-6-6-6zm-6 13H7v5c0 1.1.9 2 2 2h2v-7zM19 15h-2v7h2c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <span className="font-display tracking-wide">RecipeRealm</span>
    </Link>
  );
};

export default Logo; 