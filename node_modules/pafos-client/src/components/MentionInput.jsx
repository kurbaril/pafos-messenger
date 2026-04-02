import React, { useState, useRef, useEffect } from 'react';
import { searchUsers } from '../utils/api';
import Avatar from './Avatar';

export default function MentionInput({ value, onChange, onSend, placeholder, disabled }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const suggestionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);

    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ')) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (query.length > 0) {
        setMentionQuery(query);
        fetchSuggestions(query);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    onChange(newValue);
  };

  const fetchSuggestions = async (query) => {
    try {
      const users = await searchUsers(query);
      setSuggestions(users.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const insertMention = (username) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = value.slice(cursorPosition);
    
    const newText = textBeforeCursor.slice(0, lastAtIndex) + 
                    `@${username} ` + 
                    textAfterCursor;
    
    onChange(newText);
    setShowSuggestions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !showSuggestions) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="w-full px-4 py-2 bg-surface-hover border border-border rounded-xl resize-none focus:border-primary focus:outline-none transition-colors text-text placeholder-text-muted"
        style={{ minHeight: '44px', maxHeight: '120px' }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute bottom-full left-0 mb-1 w-64 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          {suggestions.map((user) => (
            <button
              key={user.id}
              onClick={() => insertMention(user.username)}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-surface-hover transition-colors text-left"
            >
              <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
              <div>
                <div className="font-medium text-text">@{user.username}</div>
                {user.bio && (
                  <div className="text-xs text-text-secondary truncate max-w-[180px]">
                    {user.bio}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}