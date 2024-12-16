import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          RecipeShare
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {user ? (
            <>
              <Link to="/create" className="nav-link">
                Create Recipe
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={logout} className="nav-link">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 