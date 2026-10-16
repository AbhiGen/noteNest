/**
 * @file NoteModal.jsx
 * @description Modal form for creating and editing notes.
 * 
 * Features:
 * - One reusable form for both Create and Edit modes
 * - Title input with live character counter
 * - Content textarea
 * - Comma-separated tags input with live pastel preview badges
 * - "Pin this note to top" checkbox
 * - Coral Save Note button & Cancel button
 * 
 * Comments for viva:
 * // This component handles creating and editing notes.
 * // It populates existing values when editing and resets when creating.
 */

import React, { useState, useEffect } from 'react';
import { getTagColor } from './Sidebar';

const NoteModal = ({ isOpen, onClose, onSubmit, initialNote, isSaving }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');

  // Populate form with existing note values or reset for new note
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setTagsString(Array.isArray(initialNote.tags) ? initialNote.tags.join(', ') : '');
      setIsPinned(Boolean(initialNote.isPinned));
    } else {
      setTitle('');
      setContent('');
      setTagsString('');
      setIsPinned(false);
    }
    setError('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  // Parse comma-separated string into clean unique tags array
  const parsedTags = Array.from(
    new Set(
      tagsString
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
    )
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Title validation
    if (!title.trim()) {
      setError('Please provide a note title.');
      return;
    }

    // Content validation
    if (!content.trim()) {
      setError('Please enter note content.');
      return;
    }

    if (title.trim().length > 120) {
      setError('Title cannot exceed 120 characters.');
      return;
    }

    // Submit clean payload
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags: parsedTags,
      isPinned,
    });
  };

  const isEditing = Boolean(initialNote);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, color: 'var(--heading)' }}>
            {isEditing ? 'Edit Note' : 'Create New Note'}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            {/* Note Title Input */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="modal-note-title">Note Title *</label>
                <span style={{ fontSize: '0.75rem', color: title.length > 110 ? 'var(--danger)' : 'var(--muted)' }}>
                  {title.length}/120
                </span>
              </div>
              <input
                id="modal-note-title"
                type="text"
                className="form-input"
                placeholder="e.g., Database Exam Prep"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
              />
            </div>

            {/* Note Content Textarea */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-note-content">Content *</label>
              <textarea
                id="modal-note-content"
                className="form-textarea"
                rows="6"
                placeholder="Write your note thoughts, tasks, and ideas here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Comma-Separated Tags Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-note-tags">
                Tags <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(separate with commas: college, exam, mern)</span>
              </label>
              <input
                id="modal-note-tags"
                type="text"
                className="form-input"
                placeholder="college, personal, urgent"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
              />

              {/* Live Pastel Tag Preview */}
              {parsedTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {parsedTags.map((tag) => {
                    const color = getTagColor(tag);
                    return (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: color.bg,
                          color: color.text,
                          border: `1px solid ${color.border}`,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        #{tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pin Checkbox */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="checkbox-label" htmlFor="modal-note-pin">
                <input
                  id="modal-note-pin"
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <span>Pin this note to top of dashboard</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              id="modal-save-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span>
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                'Save Note'
              ) : (
                'Save Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
