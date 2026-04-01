import React, { useState, useEffect } from 'react';
import { getDeletedMessages, restoreMessage } from '../api';
import { formatMessageTime } from '../utils/chartHelpers';
import toast from 'react-hot-toast';

export default function DeletedMessagesView({ onClose, messageId }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeletedMessage();
  }, [messageId]);

  const fetchDeletedMessage = async () => {
    try {
      const data = await getDeletedMessages({ limit: 100 });
      const found = data.logs?.find(log => log.messageId === messageId);
      setMessage(found);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!message) return;
    
    setRestoring(true);
    try {
      await restoreMessage(message.id);
      toast.success('Message restored successfully');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to restore message');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="p-8 text-center">
        <svg className="w-12 h-12 mx-auto mb-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-text-secondary">Message not found in deleted logs</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-text">Deleted Message</h2>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Message Content */}
        <div className="bg-surface-hover rounded-lg p-4">
          <div className="text-xs text-text-secondary mb-2">Original Message</div>
          <div className="text-text whitespace-pre-wrap">
            {message.messageData?.content || '(No text content)'}
          </div>
          {message.messageData?.fileUrl && (
            <div className="mt-2">
              <a
                href={message.messageData.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Download file
              </a>
            </div>
          )}
        </div>

        {/* Sender Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-hover rounded-lg p-3">
            <div className="text-xs text-text-secondary">Sender</div>
            <div className="text-text font-medium">@{message.messageSender?.username}</div>
            <div className="text-xs text-text-muted mt-1">
              ID: {message.messageData?.senderId}
            </div>
          </div>
          <div className="bg-surface-hover rounded-lg p-3">
            <div className="text-xs text-text-secondary">Deleted By</div>
            <div className="text-text font-medium">@{message.deleter?.username}</div>
            <div className="text-xs text-text-muted mt-1">
              {formatMessageTime(message.deletedAt)}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-surface-hover rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-text-secondary">Created at:</span>
              <span className="text-text ml-2">
                {new Date(message.messageData?.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-text-secondary">Chat ID:</span>
              <span className="text-text ml-2 font-mono text-xs">
                {message.messageData?.chatId?.substring(0, 12)}...
              </span>
            </div>
            <div>
              <span className="text-text-secondary">Message ID:</span>
              <span className="text-text ml-2 font-mono text-xs">
                {message.messageId?.substring(0, 12)}...
              </span>
            </div>
            <div>
              <span className="text-text-secondary">File:</span>
              <span className="text-text ml-2">
                {message.messageData?.fileName ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Close
          </button>
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="btn btn-primary"
          >
            {restoring ? 'Restoring...' : 'Restore Message'}
          </button>
        </div>

        {message.messageData?.permanent && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-warning text-sm">
            ⚠️ This message was permanently deleted and cannot be restored.
          </div>
        )}
      </div>
    </div>
  );
}