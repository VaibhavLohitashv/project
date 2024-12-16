import React from 'react';
import { Link } from 'react-router-dom';

const MinimalHeader = () => {
  return (
    <header className="minimal-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          RecipeShare
        </Link>
      </div>
    </header>
  );
};

export default MinimalHeader; 