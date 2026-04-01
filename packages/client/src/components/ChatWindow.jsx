import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { usePresence } from '../hooks/usePresence';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { formatLastSeen } from '../utils/timeFormatter';

export default function ChatWindow({ chat }) {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, sendMessage, markAsRead, markChatAsRead, startTyping, stopTyping } = useSocket();
  const { getUserStatus, getUserLastSeen } = usePresence();
  const { messages, fetchMessages, addMessage, updateMessage, deleteMessage, hasMore, loadMore } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const currentChatId = chatId || chat?.id;
  const chatMessages = messages[currentChatId] || [];

  // Load messages
  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    }
  }, [currentChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAtBottom]);

  // Mark messages as read
  useEffect(() => {
    if (currentChatId && chatMessages.length > 0) {
      const unreadMessages = chatMessages.filter(
        msg => msg.senderId !== user?.id && !msg.isRead
      );
      if (unreadMessages.length > 0) {
        markChatAsRead(currentChatId);
        unreadMessages.forEach(msg => markAsRead(msg.id));
      }
    }
  }, [currentChatId, chatMessages, user]);

  // Handle scroll to load more
  const handleScroll = useCallback(async (e) => {
    const container = e.target;
    const isNearTop = container.scrollTop < 100;
    
    if (isNearTop && hasMore[currentChatId] && !loading) {
      setLoading(true);
      await loadMore(currentChatId);
      setLoading(false);
    }
    
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setIsAtBottom(isBottom);
  }, [currentChatId, hasMore, loading, loadMore]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.chatId === currentChatId) {
        addMessage(currentChatId, message);
        if (message.senderId !== user?.id) {
          markAsRead(message.id);
        }
      }
    };

    const handleMessageEdited = (message) => {
      if (message.chatId === currentChatId) {
        updateMessage(currentChatId, message);
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      deleteMessage(currentChatId, messageId);
    };

    const handleTypingStart = ({ userId, chatId: typingChatId }) => {
      if (typingChatId === currentChatId && userId !== user?.id) {
        setTypingUsers(prev => [...new Set([...prev, userId])]);
      }
    };

    const handleTypingStop = ({ userId, chatId: typingChatId }) => {
      if (typingChatId === currentChatId) {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, currentChatId, user, addMessage, updateMessage, deleteMessage, markAsRead]);

  const handleSendMessage = async (content, fileData = null, replyToId = null) => {
    if (!content && !fileData) return;
    
    await sendMessage(currentChatId, content, null, replyToId, fileData);
    stopTyping(currentChatId);
  };

  const handleTyping = (isTyping) => {
    if (isTyping) {
      startTyping(currentChatId);
    } else {
      stopTyping(currentChatId);
    }
  };

  if (!chat && !chatId) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const chatName = chat?.name || 'Chat';
  const chatAvatar = chat?.avatar || '/default-avatar.png';
  const isOnline = chat?.type === 'PRIVATE' ? getUserStatus(chat.id) === 'online' : null;
  const lastSeen = chat?.type === 'PRIVATE' ? getUserLastSeen(chat.id) : null;

  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Header */}
      <div className="h-14 bg-surface border-b border-border flex items-center px-4 gap-3">
        <button
          className="back-button md:hidden"
          onClick={() => {
            document.querySelector('.chat-sidebar')?.classList.remove('hidden');
            document.querySelector('.chat-main')?.classList.add('hidden');
          }}
        >
          <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <img
          src={chatAvatar}
          alt={chatName}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <h3 className="font-semibold text-text">{chatName}</h3>
          {chat?.type === 'PRIVATE' && (
            <p className="text-xs text-text-secondary">
              {isOnline ? 'Online' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
            </p>
          )}
        </div>
        
        <button className="p-2 text-text-secondary hover:text-primary transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {loading && (
          <div className="flex justify-center py-2">
            <div className="spinner w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        
        {chatMessages.map((message, index) => {
          const showAvatar = index === 0 || 
            chatMessages[index - 1]?.senderId !== message.senderId;
          
          return (
            <Message
              key={message.id}
              message={message}
              isOwn={message.senderId === user?.id}
              showAvatar={showAvatar}
              onReact={(emoji) => {/* handle reaction */}}
              onReply={() => {/* handle reply */}}
              onInfo={() => {/* show message info */}}
            />
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers.map(id => 'Someone')} />
      )}

      {/* Message input */}
      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
}