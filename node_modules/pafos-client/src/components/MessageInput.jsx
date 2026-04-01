import React, { useState, useRef } from 'react';
import MentionInput from './MentionInput';
import MediaUploader from './MediaUploader';
import VoiceRecorder from './VoiceRecorder';

export default function MessageInput({ onSend, disabled, chatId }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-surface border-t border-border">
      <MediaUploader onUpload={(file) => onSend(file)} disabled={disabled} />
      
      <div className="flex-1">
        <MentionInput
          value={message}
          onChange={setMessage}
          onSend={handleSend}
          placeholder="Type a message..."
          disabled={disabled}
        />
      </div>
      
      <VoiceRecorder onSend={(voice) => onSend(voice)} disabled={disabled} />
      
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="p-2 bg-primary hover:bg-primary-hover rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
}