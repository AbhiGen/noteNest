/**
 * @file NoteCard.jsx
 * @description Card component rendering an individual note item matching NoteNest reference UI.
 * 
 * Features:
 * - Clean white card with subtle border & rounded corners
 * - Title, content preview, and formatted updatedAt timestamp
 * - Pastel tag chips with pastel backgrounds and darker readable text
 * - Coral pin toggle button
 * - Edit and Delete actions
 * 
 * Comments for viva:
 * // This component displays one note in the dashboard.
 * // Tags are styled using pastel background colors for easy visual categorization.
 */

import React from 'react';
import { getTagColor } from './Sidebar';

const NoteCard = ({ note, onEdit, onDelete, onTogglePin }) => {
  // Format updatedAt timestamp into readable date and time
  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className={`note-card ${note.isPinned ? 'pinned' : ''}`}>
      {/* Top Header: Title and Pin button */}
      <div className="card-header">
        <h3 className="note-title">{note.title}</h3>
        <button
          type="button"
          className={`pin-btn ${note.isPinned ? 'active' : ''}`}
          onClick={() => onTogglePin(note)}
          title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8l2 6v6l2 2 2-2V9l2-6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v5" />
          </svg>
        </button>
      </div>

      {/* Note Body Content */}
      <p className="note-content">{note.content}</p>

      {/* Tags section: Pastel chips matching reference UI */}
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags-list">
          {note.tags.map((tag, idx) => {
            const color = getTagColor(tag);
            return (
              <span
                key={`${tag}-${idx}`}
                className="note-tag-badge"
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  border: `1px solid ${color.border}`,
                }}
              >
                #{tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Card Footer: Updated Date & Actions */}
      <div className="card-footer">
        <span className="note-date">{formattedDate}</span>
        <div className="card-actions">
          <button
            type="button"
            className="card-action-btn edit"
            onClick={() => onEdit(note)}
            title="Edit note"
            aria-label="Edit note"
          >
            <svg style={{ width: '1.1rem', height: '1.1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            className="card-action-btn delete"
            onClick={() => onDelete(note)}
            title="Delete note"
            aria-label="Delete note"
          >
            <svg style={{ width: '1.1rem', height: '1.1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default NoteCard;
