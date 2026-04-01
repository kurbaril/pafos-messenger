import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { uploadFile } from '../utils/upload';
import { vibrateOnSend } from '../utils/vibration';
import { playSendSound } from '../utils/sound';

export default function MessageInput({ onSend, onTyping, replyTo, onCancelReply }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1500);
  };

  const handleSend = async () => {
    if (!message.trim() && !uploading) return;
    
    const success = await onSend(message.trim());
    if (success) {
      setMessage('');
      vibrateOnSend();
      playSendSound();
      onTyping(false);
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    let fileType = 'file';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('audio/')) fileType = 'voice';
    
    const result = await uploadFile(file, fileType);
    
    if (result) {
      await onSend(null, result);
    }
    
    setUploading(false);
    fileInputRef.current.value = '';
  };

  const handleVoiceRecord = () => {
    // Voice recording will be implemented later
    alert('Voice recording coming soon!');
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    inputRef.current.focus();
    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t border-border bg-surface p-3">
      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-2 p-2 bg-surface-hover rounded-lg flex items-center justify-between">
          <div className="flex-1">
            <span className="text-xs text-primary">Replying to @{replyTo.sender?.username}</span>
            <p className="text-sm text-text-secondary truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="text-text-secondary hover:text-text">
            ✕
          </button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-text-secondary hover:text-primary transition rounded-full hover:bg-surface-hover"
            disabled={uploading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,audio/*,application/pdf,.doc,.docx,.txt"
          />
        </div>
        
        {/* Voice message button */}
        <button
          onClick={handleVoiceRecord}
          className="p-2 text-text-secondary hover:text-primary transition rounded-full hover:bg-surface-hover"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        
        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-text-secondary hover:text-primary transition rounded-full hover:bg-surface-hover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 bg-surface rounded-lg shadow-lg border border-border p-2 z-10">
              <div className="grid grid-cols-6 gap-1">
                {['😀', '😂', '😍', '😎', '🥲', '😢', '😡', '👍', '❤️', '🔥', '🎉', '✨'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="w-8 h-8 text-lg hover:bg-surface-hover rounded transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Text input */}
        <div className="flex-1 bg-surface-hover rounded-lg">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-3 py-2 bg-transparent text-text placeholder-text-secondary resize-none focus:outline-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
        </div>
        
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() && !uploading}
          className={`p-2 rounded-full transition ${
            message.trim() || uploading
              ? 'bg-primary text-white hover:bg-primary-hover'
              : 'bg-surface-hover text-text-secondary cursor-not-allowed'
          }`}
        >
          {uploading ? (
            <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}