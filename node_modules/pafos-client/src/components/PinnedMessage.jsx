import React from 'react';
import Avatar from './Avatar';
import { formatMessageTime } from '../utils/timeFormatter';

export default function PinnedMessage({ message, onJumpToMessage }) {
  if (!message) return null;

  const handleClick = () => {
    if (onJumpToMessage && message.id) {
      onJumpToMessage(message.id);
    }
  };

  return (
    <div 
      className="px-4 py-2 bg-surface border-b border-border cursor-pointer hover:bg-surface-hover transition-colors group"
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 text-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-medium">Pinned message</span>
            <span>•</span>
            <span>@{message.sender?.username}</span>
            <span>•</span>
            <span>{formatMessageTime(message.createdAt)}</span>
          </div>
          <div className="text-sm text-text truncate">
            {message.isDeletedForUsers ? (
              <span className="italic text-text-muted">Message deleted</span>
            ) : (
              message.content || (message.fileUrl ? '📎 File attached' : '')
            )}
          </div>
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}