/**
 * @file TagFilter.jsx
 * @description Filter bar rendering clickable tag badges to filter notes by category.
 */

import React from 'react';

const TagFilter = ({ tags, selectedTag, onSelectTag }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="tags-filter-bar">
      <span className="tag-filter-label">Filter by Tag:</span>
      <button
        type="button"
        className={`tag-pill ${!selectedTag ? 'active' : ''}`}
        onClick={() => onSelectTag('')}
      >
        All Notes
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
          onClick={() => onSelectTag(tag === selectedTag ? '' : tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
