import React, { useState } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function MessageReactions({ message, onAddReaction, onRemoveReaction, currentUserId }) {
  const [hovered, setHovered] = useState(false);

  if (!message) return null;

  const reactionsMap = new Map();
  message.reactions?.forEach(reaction => {
    if (!reactionsMap.has(reaction.emoji)) {
      reactionsMap.set(reaction.emoji, []);
    }
    reactionsMap.get(reaction.emoji).push(reaction);
  });

  const hasUserReacted = (emoji) => {
    return message.reactions?.some(r => r.emoji === emoji && r.userId === currentUserId);
  };

  const handleReactionClick = (emoji) => {
    if (hasUserReacted(emoji)) {
      onRemoveReaction?.(message.id, emoji);
    } else {
      onAddReaction?.(message.id, emoji);
    }
  };

  return (
    <div 
      className="relative inline-flex items-center gap-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {Array.from(reactionsMap.entries()).map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          className={`
            reaction-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm
            transition-all hover:scale-105
            ${hasUserReacted(emoji) 
              ? 'bg-primary/20 text-primary' 
              : 'bg-surface-hover text-text-secondary hover:bg-surface-hover/80'}
          `}
          title={users.map(u => u.user?.username).join(', ')}
        >
          <span>{emoji}</span>
          <span className="text-xs">{users.length}</span>
        </button>
      ))}

      {hovered && (
        <div className="flex gap-1 p-1 rounded-full bg-surface-hover">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="w-7 h-7 rounded-full hover:bg-surface-hover/80 transition-all text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}