/**
 * @file DashboardPage.jsx
 * @description Main application workspace view matching NoteNest reference design.
 * 
 * Features:
 * - Left Sidebar with brand, New Note button, All Notes / Pinned navigation, dynamic tag counts, user profile
 * - Top Search Bar with debounced search and Grid/List view toggle
 * - Dedicated Pinned Notes section and Other Notes section
 * - Real dynamic note counts and tag counts
 * - Create & Edit Note modal and Delete confirmation modal
 * 
 * Comments for viva:
 * // This component manages the main dashboard workspace.
 * // This state stores the text entered in the search box.
 * // This state stores the currently selected navigation tab.
 * // This function loads the notes from the backend.
 * // This handler saves or updates the selected note.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  // Notes state
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This state stores the text entered in the search box.
  const [searchTerm, setSearchTerm] = useState('');

  // This state stores the currently selected navigation tab ('all', 'pinned', 'archived', 'trash').
  const [currentTab, setCurrentTab] = useState('all');

  // This state stores the currently selected tag filter.
  const [selectedTag, setSelectedTag] = useState('');

  // View mode toggle: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('grid');

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Note Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, note: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // This function loads the notes from the backend.
  const fetchNotes = useCallback(async (search = '', tag = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (tag.trim()) params.tag = tag.trim();

      const res = await api.get('/notes', { params });
      if (res.data.success) {
        setNotes(res.data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.response?.data?.message || 'Failed to load notes. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notes with debounced search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes(searchTerm, selectedTag);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedTag, fetchNotes]);

  // Compute dynamic tag counts directly from real database notes
  const tagsWithCounts = useMemo(() => {
    const counts = {};
    notes.forEach((note) => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [notes]);

  // Counts for sidebar
  const totalCount = notes.length;
  const pinnedCount = useMemo(() => notes.filter((n) => n.isPinned).length, [notes]);

  // Filter notes based on active sidebar tab
  const displayedNotes = useMemo(() => {
    if (currentTab === 'pinned') {
      return notes.filter((n) => n.isPinned);
    }
    if (currentTab === 'archived' || currentTab === 'trash') {
      return []; // Clean empty state for future archive/trash feature
    }
    return notes;
  }, [notes, currentTab]);

  // Split into pinned and other notes for 'all' tab
  const pinnedNotes = useMemo(() => displayedNotes.filter((n) => n.isPinned), [displayedNotes]);
  const otherNotes = useMemo(() => displayedNotes.filter((n) => !n.isPinned), [displayedNotes]);

  // Open modal for creating a new note
  const handleOpenCreateModal = () => {
    setActiveNote(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing note
  const handleOpenEditModal = (note) => {
    setActiveNote(note);
    setIsModalOpen(true);
  };

  // This handler saves or updates the selected note.
  const handleSaveNote = async (noteData) => {
    setIsSaving(true);
    try {
      if (activeNote) {
        // PUT /api/notes/:id - Update existing note
        const res = await api.put(`/notes/${activeNote._id}`, noteData);
        if (res.data.success) {
          setIsModalOpen(false);
          fetchNotes(searchTerm, selectedTag);
        }
      } else {
        // POST /api/notes - Create new note
        const res = await api.post('/notes', noteData);
        if (res.data.success) {
          setIsModalOpen(false);
          fetchNotes(searchTerm, selectedTag);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  // This handler toggles the pinned status of a note.
  const handleTogglePin = async (note) => {
    try {
      const res = await api.put(`/notes/${note._id}`, {
        isPinned: !note.isPinned,
      });
      if (res.data.success) {
        fetchNotes(searchTerm, selectedTag);
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (note) => {
    setDeleteModal({ isOpen: true, note });
  };

  // Confirm and permanently delete note
  const handleConfirmDelete = async () => {
    if (!deleteModal.note) return;
    setIsDeleting(true);
    try {
      // DELETE /api/notes/:id
      const res = await api.delete(`/notes/${deleteModal.note._id}`);
      if (res.data.success) {
        setDeleteModal({ isOpen: false, note: null });
        fetchNotes(searchTerm, selectedTag);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute view heading title
  const getViewTitle = () => {
    if (selectedTag) return `Notes tagged with #${selectedTag}`;
    if (currentTab === 'pinned') return 'Pinned Notes';
    if (currentTab === 'archived') return 'Archived Notes';
    if (currentTab === 'trash') return 'Trash';
    return 'All Notes';
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        totalCount={totalCount}
        pinnedCount={pinnedCount}
        archivedCount={0}
        trashCount={0}
        tagsWithCounts={tagsWithCounts}
        onOpenCreateModal={handleOpenCreateModal}
        user={user}
        onLogout={logout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Top Header Bar */}
        <header className="top-header">
          {/* Mobile hamburger menu */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open sidebar navigation"
          >
            <svg style={{ width: '1.4rem', height: '1.4rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Box */}
          <div className="search-box-wrap">
            <svg className="search-box-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search-notes-input"
              type="text"
              className="search-box-input"
              placeholder="Search notes by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setSearchTerm('')}
                title="Clear search"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Top Right Controls: Grid / List view toggle */}
          <div className="top-header-controls">
            <div className="view-mode-toggle" title="Switch layout view">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Grid view"
              >
                <svg style={{ width: '1.15rem', height: '1.15rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="List view"
              >
                <svg style={{ width: '1.15rem', height: '1.15rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {/* Content Header Title */}
          <div className="content-header">
            <div>
              <h1>{getViewTitle()}</h1>
              {selectedTag && (
                <button
                  type="button"
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--primary)',
                    marginTop: '0.2rem',
                    fontWeight: 600,
                  }}
                  onClick={() => setSelectedTag('')}
                >
                  ← Show all tags
                </button>
              )}
            </div>
            <span className="content-header-count">
              {displayedNotes.length} {displayedNotes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
              <div className="spinner spinner-primary"></div>
              <p style={{ marginTop: '0.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Loading notes...
              </p>
            </div>
          )}

          {/* Notes Content */}
          {!loading && (
            <>
              {/* Empty state when user has 0 notes */}
              {displayedNotes.length === 0 && !searchTerm && !selectedTag && currentTab === 'all' && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3>Your nest is empty</h3>
                  <p>Create your first note to organize ideas, study notes, and personal tasks.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleOpenCreateModal}
                  >
                    + Create Your First Note
                  </button>
                </div>
              )}

              {/* Empty state for search / tag filter */}
              {displayedNotes.length === 0 && (searchTerm || selectedTag) && (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ backgroundColor: 'var(--border)', color: 'var(--muted)' }}>
                    <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3>No matching notes found</h3>
                  <p>
                    No notes matched {searchTerm && `"${searchTerm}"`} {selectedTag && `with tag #${selectedTag}`}.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTag('');
                    }}
                  >
                    Clear Search & Filters
                  </button>
                </div>
              )}

              {/* Empty state for empty tabs (e.g. pinned with 0 notes) */}
              {displayedNotes.length === 0 && !searchTerm && !selectedTag && currentTab !== 'all' && (
                <div className="empty-state">
                  <h3>No notes in {getViewTitle()}</h3>
                  <p>You do not have any notes in this category right now.</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCurrentTab('all')}
                  >
                    View All Notes
                  </button>
                </div>
              )}

              {/* Tab: All Notes (shows Pinned Section + Other Section) */}
              {currentTab === 'all' && !selectedTag && !searchTerm && (
                <>
                  {/* Pinned Section */}
                  {pinnedNotes.length > 0 && (
                    <section className="notes-block">
                      <h2 className="notes-block-title">
                        <svg style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 3H8l2 6v6l2 2 2-2V9l2-6z" />
                        </svg>
                        <span>PINNED NOTES ({pinnedNotes.length})</span>
                      </h2>
                      <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                        {pinnedNotes.map((note) => (
                          <NoteCard
                            key={note._id}
                            note={note}
                            onEdit={handleOpenEditModal}
                            onDelete={handleOpenDeleteModal}
                            onTogglePin={handleTogglePin}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Other Notes Section */}
                  {otherNotes.length > 0 && (
                    <section className="notes-block">
                      {pinnedNotes.length > 0 && (
                        <h2 className="notes-block-title">
                          <span>ALL OTHER NOTES ({otherNotes.length})</span>
                        </h2>
                      )}
                      <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                        {otherNotes.map((note) => (
                          <NoteCard
                            key={note._id}
                            note={note}
                            onEdit={handleOpenEditModal}
                            onDelete={handleOpenDeleteModal}
                            onTogglePin={handleTogglePin}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Filtered View (by search, tag, or pinned tab) */}
              {(currentTab !== 'all' || selectedTag || searchTerm) && displayedNotes.length > 0 && (
                <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {displayedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Note Create / Edit Modal Form */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveNote}
        initialNote={activeNote}
        isSaving={isSaving}
      />

      {/* Safe Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, note: null })}
        onConfirm={handleConfirmDelete}
        noteTitle={deleteModal.note?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;
