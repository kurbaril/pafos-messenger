import React from 'react';
import ReactModal from 'react-modal';
import Avatar from './Avatar';
import { formatFullTimestamp, formatReadTime } from '../utils/timeFormatter';

if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

export default function MessageInfo({ isOpen, onClose, message }) {
  if (!message) return null;

  const readCount = message.readBy?.length || 0;
  const totalMembers = message.chat?.users?.length || 2;
  const isFullyRead = readCount === totalMembers - 1; // excluding sender

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4"
      className="bg-surface rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto outline-none"
      closeTimeoutMS={200}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text">Message Info</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-hover rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sender */}
        <div className="mb-4 p-3 bg-surface-hover rounded-lg">
          <div className="text-xs text-text-secondary mb-2">Sent by</div>
          <div className="flex items-center gap-3">
            <Avatar src={message.sender?.avatarUrl} alt={message.sender?.username} size="md" />
            <div>
              <div className="font-medium text-text">@{message.sender?.username}</div>
              <div className="text-xs text-text-secondary">
                {formatFullTimestamp(message.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="mb-4 p-3 bg-surface-hover rounded-lg">
          <div className="text-xs text-text-secondary mb-2">Message</div>
          <div className="text-text break-words">
            {message.isDeleted ? (
              <span className="italic text-text-secondary">Message deleted</span>
            ) : (
              message.content
            )}
          </div>
          {message.fileUrl && (
            <div className="mt-2 text-xs text-primary">
              📎 {message.fileName || 'File attached'}
            </div>
          )}
        </div>

        {/* Edit History */}
        {message.editHistory?.length > 0 && (
          <div className="mb-4 p-3 bg-surface-hover rounded-lg">
            <div className="text-xs text-text-secondary mb-2">
              Edited {message.editHistory.length} time{message.editHistory.length > 1 ? 's' : ''}
            </div>
            <div className="space-y-2 text-sm">
              {message.editHistory.slice(0, 3).map((edit, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-2">
                  <div className="text-xs text-text-secondary">
                    {formatReadTime(edit.editedAt)}
                  </div>
                  <div className="text-text-secondary line-through text-sm">
                    {edit.oldContent?.substring(0, 100)}
                  </div>
                  <div className="text-text text-sm">
                    {edit.newContent?.substring(0, 100)}
                  </div>
                </div>
              ))}
              {message.editHistory.length > 3 && (
                <div className="text-xs text-text-secondary">
                  +{message.editHistory.length - 3} more edits
                </div>
              )}
            </div>
          </div>
        )}

        {/* Read Receipts */}
        <div className="p-3 bg-surface-hover rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-text-secondary">Read by</div>
            <div className="text-xs text-text-secondary">
              {readCount} / {totalMembers - 1}
              {isFullyRead && <span className="ml-1 text-success">✓✓ All read</span>}
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {message.readBy?.length > 0 ? (
              message.readBy.map((reader) => (
                <div key={reader.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar src={reader.user?.avatarUrl} alt={reader.user?.username} size="xs" />
                    <span className="text-sm text-text">@{reader.user?.username}</span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {formatReadTime(reader.readAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-text-secondary text-center py-2">
                No one has read this message yet
              </div>
            )}
          </div>
        </div>

        {/* Message ID (for debugging) */}
        <div className="mt-4 text-center">
          <div className="text-xs text-text-muted">
            Message ID: {message.id}
          </div>
        </div>
      </div>
    </ReactModal>
  );
}