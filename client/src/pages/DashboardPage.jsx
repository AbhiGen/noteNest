// DashboardPage.jsx - Main Application Workspace
// This is the primary page component that manages notes, search, filtering, and modals.

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import '../styles/dashboard.css';

const DashboardPage = () => {
  // ==========================================
  // 1. STATE VARIABLES
  // ==========================================

  // WHAT: Stores the list of notes fetched from MongoDB.
  // WHY: React components re-render automatically whenever state changes, updating the UI.
  const [notes, setNotes] = useState([]);

  // WHAT: Tracks whether an API call is currently in progress.
  // WHY: Gives visual feedback (spinner) so the user knows data is loading.
  const [loading, setLoading] = useState(true);

  // WHAT: Stores any error message returned from the backend.
  // WHY: Displays a friendly alert banner instead of crashing the app.
  const [error, setError] = useState('');

  // WHAT: Stores the text typed into the top search bar.
  // WHY: Allows filtering notes in real-time by keyword.
  const [searchTerm, setSearchTerm] = useState('');

  // WHAT: Stores which navigation tab is active ('all', 'pinned', 'archived', 'trash').
  // WHY: Lets the user switch between all notes and pinned notes easily.
  const [currentTab, setCurrentTab] = useState('all');

  // WHAT: Stores the currently selected tag filter (e.g. 'college' or 'project').
  // WHY: Clicking a tag in the sidebar filters the workspace to only notes with that tag.
  const [selectedTag, setSelectedTag] = useState('');

  // WHAT: Stores layout view mode: 'grid' (cards in rows/columns) or 'list' (stacked full width).
  // WHY: Gives users flexibility in how they view their notes.
  const [viewMode, setViewMode] = useState('grid');

  // WHAT: Tracks whether the mobile drawer navigation is open.
  // WHY: Provides a responsive sidebar for mobile and tablet screens.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // WHAT: Controls visibility of the Create / Edit Note modal dialog.
  // WHY: Modals keep the user on the same page instead of navigating to a new URL.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // WHAT: Holds the note currently being edited, or null if creating a brand new note.
  // WHY: Allows the same NoteModal component to handle both Create and Edit operations.
  const [activeNote, setActiveNote] = useState(null);

  // WHAT: Tracks if the Save button request is in progress.
  // WHY: Prevents duplicate submissions if a user clicks "Save" multiple times quickly.
  const [isSaving, setIsSaving] = useState(false);

  // WHAT: Holds state for the delete confirmation popup ({ isOpen: boolean, note: object }).
  // WHY: Confirms user intent before permanently deleting data (defensive UX).
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, note: null });

  // WHAT: Tracks if a delete HTTP request is currently processing.
  // WHY: Shows a loading indicator on the delete button while backend deletes the note.
  const [isDeleting, setIsDeleting] = useState(false);


  // ==========================================
  // 2. DATA FETCHING (GET /api/notes)
  // ==========================================

  // WHAT: Fetches notes from Express backend using Axios.
  // WHY: Connects frontend React with the MongoDB backend to load fresh data.
  const fetchNotes = async (search = '', tag = '') => {
    setLoading(true);
    setError('');

    try {
      // Build optional query parameters for search and tag
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (tag.trim()) params.tag = tag.trim();

      // Send GET request to /api/notes
      const res = await api.get('/notes', { params });

      if (res.data.success) {
        setNotes(res.data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.response?.data?.message || 'Failed to load notes. Please check connection.');
    } finally {
      // Always turn off loading spinner once request finishes
      setLoading(false);
    }
  };


  // ==========================================
  // 3. SEARCH DEBOUNCING (useEffect)
  // ==========================================

  // WHAT: Delays calling fetchNotes by 250 milliseconds after user types in search box.
  // WHY: Without debouncing, an HTTP request fires on every keystroke, which overloads the server.
  //      Debouncing waits until the user finishes typing before making the network call.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(searchTerm, selectedTag);
    }, 250);

    // Cleanup: cancels previous timer if user types another letter before 250ms passes
    return () => clearTimeout(timer);
  }, [searchTerm, selectedTag]);


  // ==========================================
  // 4. COMPUTED COUNTS & FILTERING (Helpers)
  // ==========================================

  // WHAT: Counts how many notes exist for each tag.
  // WHY: The sidebar displays real badges with note counts next to each tag (e.g. #college (3)).
  const tagCountsMap = {};
  notes.forEach((note) => {
    if (Array.isArray(note.tags)) {
      note.tags.forEach((tag) => {
        tagCountsMap[tag] = (tagCountsMap[tag] || 0) + 1;
      });
    }
  });
  const tagsWithCounts = Object.entries(tagCountsMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Counts for sidebar badges
  const totalCount = notes.length;
  const pinnedCount = notes.filter((n) => n.isPinned).length;

  // WHAT: Filters notes based on the active sidebar tab.
  // WHY: If user clicks "Pinned", only show pinned notes; otherwise show all notes.
  let displayedNotes = notes;
  if (currentTab === 'pinned') {
    displayedNotes = notes.filter((n) => n.isPinned);
  } else if (currentTab === 'archived' || currentTab === 'trash') {
    displayedNotes = []; // Clean empty view for archived/trash categories
  }

  // Split displayed notes into Pinned vs Others for organized dashboard layout
  const pinnedNotes = displayedNotes.filter((n) => n.isPinned);
  const otherNotes = displayedNotes.filter((n) => !n.isPinned);


  // ==========================================
  // 5. MODAL HANDLERS (Create, Edit, Delete)
  // ==========================================

  // WHAT: Opens modal in "Create" mode.
  // WHY: Sets activeNote to null so the modal opens with blank input fields.
  const handleOpenCreateModal = () => {
    setActiveNote(null);
    setIsModalOpen(true);
  };

  // WHAT: Opens modal in "Edit" mode with existing note data.
  // WHY: Passes the selected note to activeNote so the form pre-fills title, content, and tags.
  const handleOpenEditModal = (note) => {
    setActiveNote(note);
    setIsModalOpen(true);
  };

  // WHAT: Saves note (POST if new, PUT if updating).
  // WHY: Uses one clean function to handle both creation and editing.
  const handleSaveNote = async (noteData) => {
    setIsSaving(true);
    try {
      if (activeNote) {
        // Editing existing note: PUT /api/notes/:id
        const res = await api.put(`/notes/${activeNote._id}`, noteData);
        if (res.data.success) {
          setIsModalOpen(false);
          fetchNotes(searchTerm, selectedTag);
        }
      } else {
        // Creating new note: POST /api/notes
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

  // WHAT: Toggles the pinned status of a note directly from the card.
  // WHY: Users can quickly pin or unpin notes with one click without opening the edit form.
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

  // WHAT: Opens the delete confirmation dialog.
  // WHY: Stores the note object so the modal can display the note's title before deleting.
  const handleOpenDeleteModal = (note) => {
    setDeleteModal({ isOpen: true, note });
  };

  // WHAT: Permanently deletes the note from MongoDB via DELETE /api/notes/:id.
  // WHY: Executes deletion only after user confirms in the modal popup.
  const handleConfirmDelete = async () => {
    if (!deleteModal.note) return;
    setIsDeleting(true);

    try {
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

  // WHAT: Computes dynamic heading title based on active filter.
  // WHY: Informs user what filter is currently applied (e.g., "Notes tagged with #college").
  const getViewTitle = () => {
    if (selectedTag) return `Notes tagged with #${selectedTag}`;
    if (currentTab === 'pinned') return 'Pinned Notes';
    if (currentTab === 'archived') return 'Archived Notes';
    if (currentTab === 'trash') return 'Trash';
    return 'All Notes';
  };


  // ==========================================
  // 6. RENDER USER INTERFACE
  // ==========================================
  return (
    <div className="app-container">
      {/* 6.1. Left Sidebar Navigation */}
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
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 6.2. Main Workspace */}
      <div className="main-workspace">
        {/* Top Header Bar */}
        <header className="top-header">
          {/* Mobile hamburger menu button */}
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

          {/* Search Box Input */}
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
            {/* Clear search button appears only when text is present */}
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

          {/* Grid / List View Toggle Buttons */}
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
          {/* Header Title & Note Count */}
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

          {/* Error Banner */}
          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
              <div className="spinner spinner-primary"></div>
              <p style={{ marginTop: '0.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Loading notes...
              </p>
            </div>
          )}

          {/* Main Notes Content (shown when loading is false) */}
          {!loading && (
            <>
              {/* Empty state: 0 notes in database */}
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

              {/* Empty state: No search or tag matches */}
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

              {/* Tab: All Notes View (shows Pinned Section + Other Section) */}
              {currentTab === 'all' && !selectedTag && !searchTerm && (
                <>
                  {/* Pinned Notes Section */}
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

              {/* Filtered View (shown when search, tag, or pinned tab is active) */}
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

      {/* 6.3. Create / Edit Note Modal Popup */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveNote}
        initialNote={activeNote}
        isSaving={isSaving}
      />

      {/* 6.4. Delete Confirmation Modal Popup */}
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
