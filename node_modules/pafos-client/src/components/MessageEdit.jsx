import React, { useState, useEffect, useRef } from 'react';
import ReactModal from 'react-modal';

if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

export default function MessageEdit({ isOpen, onClose, message, onSave }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && message) {
      setContent(message.content || '');
      setError('');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(content.length, content.length);
        }
      }, 100);
    }
  }, [isOpen, message]);

  const handleSave = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Message cannot be empty');
      return;
    }

    if (trimmedContent === message.content) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSave(message.id, trimmedContent);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to edit message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4"
      className="bg-surface rounded-xl max-w-lg w-full outline-none"
      closeTimeoutMS={200}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text">Edit Message</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-hover rounded-full transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Edit your message..."
            rows={4}
            disabled={loading}
            className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg resize-none focus:border-primary focus:outline-none transition-colors text-text placeholder-text-muted"
          />
          {error && (
            <p className="mt-2 text-sm text-error">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>

        <div className="mt-3 text-xs text-text-muted text-center">
          Press Enter to save, Esc to cancel
        </div>
      </div>
    </ReactModal>
  );
}