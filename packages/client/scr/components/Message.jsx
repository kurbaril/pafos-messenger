import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatMessageTime, formatDuration } from '../utils/timeFormatter';
import { vibrateOnReaction } from '../utils/vibration';
import { playReactionSound } from '../utils/sound';

export default function Message({ message, isOwn, showAvatar, onReact, onReply, onInfo }) {
  const [showReactions, setShowReactions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [animateReaction, setAnimateReaction] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const contextMenuRef = useRef(null);
  const { user } = useAuth();

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleReaction = (emoji) => {
    onReact(message.id, emoji);
    setAnimateReaction(emoji);
    vibrateOnReaction();
    playReactionSound();
    setTimeout(() => setAnimateReaction(null), 300);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const renderContent = () => {
    if (message.isDeletedForUsers) {
      return (
        <span className="italic text-text-secondary">
          {isOwn ? 'You deleted this message' : 'Message deleted'}
        </span>
      );
    }

    if (message.fileUrl) {
      if (message.fileType === 'image') {
        return (
          <div className="mt-1">
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="max-w-[300px] max-h-[300px] rounded-lg cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          </div>
        );
      }
      
      if (message.fileType === 'voice') {
        return (
          <div className="flex items-center gap-2 mt-1">
            <button className="w-8 h-8 flex items-center justify-center bg-surface-hover rounded-full">
              <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-sm">{formatDuration(message.duration)}</span>
          </div>
        );
      }
      
      return (
        <div className="flex items-center gap-2 mt-1 p-2 bg-surface-hover rounded-lg">
          <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.fileName}</p>
            <p className="text-xs text-text-secondary">{Math.round(message.fileSize / 1024)} KB</p>
          </div>
          <a
            href={message.fileUrl}
            download
            className="text-primary hover:text-primary-hover text-sm"
          >
            Download
          </a>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words">
        {message.quoted && (
          <div className="mb-1 pb-1 border-l-2 border-primary pl-2 text-xs text-text-secondary">
            <span className="font-medium">@{message.quoted.sender?.username}</span>
            <p className="truncate">{message.quoted.content}</p>
          </div>
        )}
        {message.content}
      </div>
    );
  };

  const reactionGroups = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[75%]`}>
        {showAvatar && !isOwn && (
          <img
            src={message.sender?.avatarUrl || '/default-avatar.png'}
            alt={message.sender?.username}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}
        
        <div className="relative">
          <div
            className={`px-3 py-2 rounded-2xl ${
              isOwn
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-surface text-text rounded-bl-sm'
            }`}
            onClick={() => onInfo?.(message)}
          >
            {!isOwn && showAvatar && (
              <div className="text-xs text-text-secondary mb-1">
                @{message.sender?.username}
              </div>
            )}
            
            {renderContent()}
            
            <div className={`flex items-center gap-1 mt-1 text-xs ${
              isOwn ? 'text-primary-light' : 'text-text-secondary'
            }`}>
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOwn && (
                <span>
                  {message.readBy?.length > 0 ? '✓✓' : '✓'}
                </span>
              )}
              {message.editedAt && (
                <span className="italic">(edited)</span>
              )}
            </div>
          </div>
          
          {/* Reactions display */}
          {reactionGroups && Object.keys(reactionGroups).length > 0 && (
            <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(reactionGroups).map(([emoji, count]) => (
                <span key={emoji} className="bg-surface-hover px-1.5 py-0.5 rounded-full text-xs">
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
          
          {/* Reaction panel on hover */}
          {isHovered && !message.isDeletedForUsers && (
            <div
              className={`absolute -top-10 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 bg-surface rounded-full shadow-lg p-1 z-10`}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {reactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="w-8 h-8 hover:bg-surface-hover rounded-full transition-all text-lg hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => onReply?.(message)}
                className="w-8 h-8 hover:bg-surface-hover rounded-full transition-all"
              >
                ↩️
              </button>
            </div>
          )}
          
          {/* Flying reaction animation */}
          {animateReaction && (
            <div className={`reaction-animate absolute -top-10 ${isOwn ? 'right-0' : 'left-0'} text-2xl pointer-events-none`}>
              {animateReaction}
            </div>
          )}
        </div>
      </div>
      
      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-20 bg-surface rounded-lg shadow-lg border border-border py-1"
          style={{ top: 'auto', left: 'auto' }}
        >
          <button
            onClick={() => {
              onReply?.(message);
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-surface-hover transition"
          >
            Reply
          </button>
          {isOwn && (
            <button
              onClick={() => {
                // Handle edit
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-surface-hover transition"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => {
              // Handle delete
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-error hover:bg-surface-hover transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}