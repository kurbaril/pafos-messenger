import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useAuth } from '../hooks/useAuth';
import { usePresence } from '../hooks/usePresence';
import { formatMessageTime, formatLastSeen } from '../utils/timeFormatter';

export default function ChatList({ onSelectChat, selectedId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const { chats, fetchChats, searchUsers, createPrivateChat } = useChatStore();
  const { user } = useAuth();
  const { getUserStatus } = usePresence();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const handleChatSelect = (chat) => {
    onSelectChat(chat);
    if (window.innerWidth <= 768) {
      document.querySelector('.chat-sidebar')?.classList.add('hidden');
      document.querySelector('.chat-main')?.classList.remove('hidden');
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = await searchUsers(query);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const startChat = async (targetUser) => {
    const chat = await createPrivateChat(targetUser.id);
    if (chat) {
      setSearchQuery('');
      setShowSearch(false);
      handleChatSelect(chat);
    }
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'PRIVATE') {
      return chat.avatar || '/default-avatar.png';
    }
    return chat.avatar || '/default-group.png';
  };

  const getChatName = (chat) => {
    if (chat.type === 'PRIVATE') {
      return chat.name;
    }
    return chat.name || 'Group';
  };

  const getLastMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    if (message.isDeletedForUsers) return 'Message deleted';
    if (message.fileUrl) return `📎 ${message.fileName || 'File'}`;
    if (message.content?.length > 50) return message.content.substring(0, 50) + '...';
    return message.content || 'No messages yet';
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Messages</h2>
          <button
            onClick={() => navigate('/create-group')}
            className="p-2 text-text-secondary hover:text-primary transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search users or chats..."
            className="w-full px-4 py-2 pl-10 bg-surface-hover border border-border rounded-lg text-text placeholder-text-secondary focus:border-primary focus:outline-none transition"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Search Results */}
      {showSearch && searchResults.length > 0 && (
        <div className="border-b border-border">
          <div className="p-2 text-xs text-text-secondary px-4">Search Results</div>
          {searchResults.map(user => (
            <div
              key={user.id}
              onClick={() => startChat(user)}
              className="flex items-center gap-3 p-3 hover:bg-surface-hover cursor-pointer transition"
            >
              <img
                src={user.avatarUrl || '/default-avatar.png'}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">@{user.username}</span>
                </div>
                {user.bio && (
                  <p className="text-sm text-text-secondary truncate">{user.bio}</p>
                )}
              </div>
              <button className="text-primary text-sm">Message</button>
            </div>
          ))}
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p>No messages yet</p>
            <p className="text-sm mt-1">Search for users to start chatting</p>
          </div>
        ) : (
          chats.map(chat => {
            const isSelected = selectedId === chat.id;
            const lastMessage = chat.lastMessage;
            const unreadCount = chat.unreadCount || 0;
            
            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                  isSelected
                    ? 'bg-primary bg-opacity-10 border-l-4 border-primary'
                    : 'hover:bg-surface-hover'
                }`}
              >
                <div className="relative">
                  <img
                    src={getChatAvatar(chat)}
                    alt={getChatName(chat)}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.type === 'PRIVATE' && (
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${
                      getUserStatus(chat.id) === 'online' ? 'bg-success' : 'bg-offline'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text truncate">
                      {getChatName(chat)}
                    </span>
                    {lastMessage && (
                      <span className="text-xs text-text-secondary">
                        {formatMessageTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-text-secondary truncate">
                      {lastMessage?.sender?.id === user?.id ? 'You: ' : ''}
                      {getLastMessagePreview(lastMessage)}
                    </p>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}