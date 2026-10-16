/**
 * @file Navbar.jsx
 * @description Top navigation bar displaying brand logo, user badge, and logout action.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  // Get initial for user avatar
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <span>NoteNest</span>
        </div>

        <div className="navbar-user-section">
          <div className="user-badge" title={`Signed in as ${user?.email}`}>
            <div className="user-avatar">{initial}</div>
            <span className="user-name">{user?.name || 'User'}</span>
          </div>

          <button
            id="logout-btn"
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Log out of NoteNest"
          >
            <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
