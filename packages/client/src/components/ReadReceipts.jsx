import React, { useState } from 'react';
import ReactModal from 'react-modal';
import Avatar from './Avatar';
import { formatReadTime } from '../utils/timeFormatter';

if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

export default function ReadReceipts({ message, isOwn }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!message) return null;

  const readCount = message.readBy?.length || 0;
  const totalMembers = message.chat?.users?.length || 2;
  const isFullyRead = readCount === totalMembers - 1; // excluding sender

  const getStatusIcon = () => {
    if (isOwn) {
      if (isFullyRead) {
        return (
          <div className="relative" title="Read by everyone">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <svg className="w-4 h-4 text-primary -ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      }
      if (readCount > 0) {
        return (
          <div className="relative" title={`Read by ${readCount} people`}>
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <svg className="w-4 h-4 text-text-muted -ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      }
      return (
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Sent">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    return null;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors"
        title="View read receipts"
      >
        {getStatusIcon()}
        {isOwn && readCount > 0 && (
          <span className="text-xs">{readCount}</span>
        )}
      </button>

      <ReactModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        overlayClassName="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4"
        className="bg-surface rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto outline-none"
        closeTimeoutMS={200}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text">Read Receipts</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-surface-hover rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-surface-hover rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text">Read by</span>
              <span className="text-sm text-text-secondary">
                {readCount} / {totalMembers - 1}
                {isFullyRead && <span className="ml-2 text-success text-xs">✓ All read</span>}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {message.readBy?.length > 0 ? (
              message.readBy.map((reader) => (
                <div key={reader.userId} className="flex items-center justify-between p-2 hover:bg-surface-hover rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar src={reader.user?.avatarUrl} alt={reader.user?.username} size="sm" />
                    <div>
                      <div className="font-medium text-text">@{reader.user?.username}</div>
                      <div className="text-xs text-text-secondary">
                        {formatReadTime(reader.readAt)}
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <p>No one has read this message yet</p>
                <p className="text-sm mt-1">Check back later</p>
              </div>
            )}
          </div>

          {/* Not read yet section */}
          {message.chat?.users && message.readBy?.length < totalMembers - 1 && (
            <>
              <div className="mt-4 mb-2">
                <div className="text-sm text-text-secondary">Not read yet</div>
              </div>
              <div className="space-y-2">
                {message.chat.users
                  .filter(u => u.userId !== message.senderId && !message.readBy?.some(r => r.userId === u.userId))
                  .map((user) => (
                    <div key={user.userId} className="flex items-center gap-3 p-2 opacity-60">
                      <Avatar src={user.user?.avatarUrl} alt={user.user?.username} size="sm" />
                      <div className="font-medium text-text">@{user.user?.username}</div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </ReactModal>
    </>
  );
}