/**
 * @file Sidebar.jsx
 * @description Left Sidebar Navigation matching NoteNest reference layout.
 * 
 * Features:
 * - NoteNest logo & brand title
 * - + New Note coral action button
 * - Navigation links: All Notes, Pinned, Archived, Trash with real counts
 * - Tags section with colored indicator dots and real note counts
 * - User profile badge & logout action
 * 
 * Comments for viva:
 * // This component renders the left navigation sidebar.
 * // Note counts and tag counts are computed dynamically from actual database data.
 */

import React from 'react';

// Deterministic pastel tag color lookup
export const getTagColor = (tagName = '') => {
  const colors = [
    { bg: 'var(--tag-green)', dot: '#10b981', text: '#065f46', border: '#a7f3d0' },
    { bg: 'var(--tag-yellow)', dot: '#f59e0b', text: '#92400e', border: '#fde68a' },
    { bg: 'var(--tag-pink)', dot: '#f43f5e', text: '#9f1239', border: '#fecdd3' },
    { bg: 'var(--tag-purple)', dot: '#8b5cf6', text: '#5b21b6', border: '#ddd6fe' },
  ];
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Sidebar = ({
  currentTab,
  onSelectTab,
  selectedTag,
  onSelectTag,
  totalCount = 0,
  pinnedCount = 0,
  archivedCount = 0,
  trashCount = 0,
  tagsWithCounts = [],
  onOpenCreateModal,
  user,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  // First initial of user name
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleNavClick = (tab) => {
    onSelectTab(tab);
    onSelectTag(''); // Reset specific tag when switching main tabs
    if (onCloseMobile) onCloseMobile();
  };

  const handleTagClick = (tag) => {
    onSelectTag(selectedTag === tag ? '' : tag);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <div>
            <h2 className="sidebar-title">NoteNest</h2>
            <span className="sidebar-subtitle">Personal Notes</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="sidebar-action-wrap">
          <button
            id="sidebar-new-note-btn"
            type="button"
            className="btn btn-primary sidebar-new-btn"
            onClick={() => {
              onOpenCreateModal();
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <svg style={{ width: '1.2rem', height: '1.2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Note</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-section">
          <div className="sidebar-section-label">NAVIGATE</div>
          <nav className="sidebar-nav">
            {/* All Notes */}
            <button
              type="button"
              className={`sidebar-nav-item ${currentTab === 'all' && !selectedTag ? 'active' : ''}`}
              onClick={() => handleNavClick('all')}
            >
              <div className="sidebar-nav-item-left">
                <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Notes</span>
              </div>
              <span className="sidebar-count-badge">{totalCount}</span>
            </button>

            {/* Pinned Notes */}
            <button
              type="button"
              className={`sidebar-nav-item ${currentTab === 'pinned' && !selectedTag ? 'active' : ''}`}
              onClick={() => handleNavClick('pinned')}
            >
              <div className="sidebar-nav-item-left">
                <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3H8l2 6v6l2 2 2-2V9l2-6z" />
                </svg>
                <span>Pinned</span>
              </div>
              <span className="sidebar-count-badge">{pinnedCount}</span>
            </button>

            {/* Archived Notes */}
            <button
              type="button"
              className={`sidebar-nav-item ${currentTab === 'archived' && !selectedTag ? 'active' : ''}`}
              onClick={() => handleNavClick('archived')}
            >
              <div className="sidebar-nav-item-left">
                <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Archived</span>
              </div>
              <span className="sidebar-count-badge">{archivedCount}</span>
            </button>

            {/* Trash */}
            <button
              type="button"
              className={`sidebar-nav-item ${currentTab === 'trash' && !selectedTag ? 'active' : ''}`}
              onClick={() => handleNavClick('trash')}
            >
              <div className="sidebar-nav-item-left">
                <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Trash</span>
              </div>
              <span className="sidebar-count-badge">{trashCount}</span>
            </button>
          </nav>
        </div>

        {/* Tags Section */}
        <div className="sidebar-nav-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="sidebar-section-label">TAGS</div>
          {tagsWithCounts.length === 0 ? (
            <p className="sidebar-no-tags">No tags added yet</p>
          ) : (
            <nav className="sidebar-nav">
              {tagsWithCounts.map(({ name, count }) => {
                const colorInfo = getTagColor(name);
                const isSelected = selectedTag === name;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`sidebar-nav-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleTagClick(name)}
                  >
                    <div className="sidebar-nav-item-left">
                      <span
                        className="sidebar-tag-dot"
                        style={{ backgroundColor: colorInfo.dot }}
                      />
                      <span>#{name}</span>
                    </div>
                    <span className="sidebar-count-badge">{count}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Bottom User Profile Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user-info" title={user?.email}>
            <div className="sidebar-user-avatar">{userInitial}</div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            type="button"
            className="sidebar-logout-btn"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
          >
            <svg style={{ width: '1.2rem', height: '1.2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
