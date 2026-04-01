import React from 'react';

export default function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users.length} people are typing...`;
    }
  };

  return (
    <div className="typing-indicator flex items-center gap-2 px-4 py-2 text-sm text-text-secondary animate-fadeIn">
      <div className="flex gap-1">
        <div className="typing-dot w-2 h-2 bg-text-secondary rounded-full" />
        <div className="typing-dot w-2 h-2 bg-text-secondary rounded-full" />
        <div className="typing-dot w-2 h-2 bg-text-secondary rounded-full" />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}