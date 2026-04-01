import React from 'react';
import Avatar from './Avatar';
import { formatMessageTime } from '../utils/timeFormatter';

export default function QuotedMessage({ quoted, onJumpToMessage }) {
  if (!quoted) return null;

  const handleClick = () => {
    if (onJumpToMessage && quoted.id) {
      onJumpToMessage(quoted.id);
    }
  };

  const isDeleted = quoted.isDeletedForUsers;

  return (
    <div 
      className="quoted-message mb-2 p-2 bg-surface-hover rounded-lg border-l-3 border-primary cursor-pointer hover:bg-surface-hover/80 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        <Avatar src={quoted.sender?.avatarUrl} alt={quoted.sender?.username} size="xs" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-primary">@{quoted.sender?.username}</span>
            <span className="text-text-muted">{formatMessageTime(quoted.createdAt)}</span>
          </div>
          <div className="text-sm text-text-secondary truncate">
            {isDeleted ? (
              <span className="italic">Message deleted</span>
            ) : (
              quoted.content || (quoted.fileUrl ? '📎 Attached file' : '')
            )}
          </div>
        </div>
        <svg className="w-3 h-3 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}