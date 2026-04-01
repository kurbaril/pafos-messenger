import React from 'react';
import Avatar from './Avatar';
import { formatMessageTime } from '../utils/timeFormatter';

export default function SearchResults({ results, activeTab, onSelectChat, onSelectUser }) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <svg className="w-12 h-12 mx-auto mb-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p>No results found</p>
        <p className="text-sm">Try a different search term</p>
      </div>
    );
  }

  const renderMessageResult = (msg) => (
    <button
      key={msg.id}
      onClick={() => onSelectChat?.({ id: msg.chat.id, name: msg.chat.name })}
      className="w-full p-3 hover:bg-surface-hover rounded-lg transition-colors text-left"
    >
      <div className="flex items-start gap-3">
        <Avatar src={msg.sender?.avatarUrl} alt={msg.sender?.username} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <span className="font-medium text-text">@{msg.sender?.username}</span>
            <span className="text-xs text-text-muted">
              {formatMessageTime(msg.createdAt)}
            </span>
          </div>
          <div className="text-sm text-text-secondary truncate">
            in {msg.chat.name}
          </div>
          <div className="text-sm text-text mt-1 line-clamp-2">
            {msg.content}
          </div>
        </div>
      </div>
    </button>
  );

  const renderChatResult = (chat) => (
    <button
      key={chat.id}
      onClick={() => onSelectChat?.(chat)}
      className="w-full p-3 hover:bg-surface-hover rounded-lg transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <Avatar src={chat.avatar} alt={chat.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-text">{chat.name}</div>
          <div className="text-sm text-text-secondary truncate">
            {chat.type === 'PRIVATE' ? 'Private chat' : 'Group'}
          </div>
          {chat.lastMessage && (
            <div className="text-xs text-text-muted truncate mt-1">
              {chat.lastMessage}
            </div>
          )}
        </div>
      </div>
    </button>
  );

  const renderUserResult = (user) => (
    <button
      key={user.id}
      onClick={() => onSelectUser?.(user)}
      className="w-full p-3 hover:bg-surface-hover rounded-lg transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <Avatar src={user.avatarUrl} alt={user.username} size="md" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-text">@{user.username}</div>
          {user.bio && (
            <div className="text-sm text-text-secondary truncate">
              {user.bio}
            </div>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-1">
      {results.map((item) => {
        if (item.content !== undefined) return renderMessageResult(item);
        if (item.type === 'PRIVATE' || item.type === 'GROUP') return renderChatResult(item);
        if (item.username) return renderUserResult(item);
        return null;
      })}
    </div>
  );
}