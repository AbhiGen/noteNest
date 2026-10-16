/**
 * @file SearchBar.jsx
 * @description Search input component for filtering notes by title and content.
 */

import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, onClear }) => {
  return (
    <div className="search-wrapper">
      <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        id="search-notes-input"
        type="text"
        className="search-input"
        placeholder="Search notes by title or content..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={onClear}
          title="Clear search"
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default SearchBar;
