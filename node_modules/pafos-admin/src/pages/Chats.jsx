import React, { useState, useEffect } from 'react';
import { getChats, getChatMessages } from '../api';
import { formatMessageTime } from '../utils/chartHelpers';

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const data = await getChats();
      setChats(data.chats || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setMessagesLoading(true);
    try {
      const data = await getChatMessages(chat.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Chat List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-text mb-3">Chats</h1>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg focus:border-primary focus:outline-none text-text"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No chats found
            </div>
          ) : (
            filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full p-3 text-left hover:bg-surface-hover transition-colors border-b border-border ${
                  selectedChat?.id === chat.id ? 'bg-surface-hover' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text truncate">{chat.name}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {chat.type === 'PRIVATE' ? 'Private' : 'Group'} • {chat.memberCount} members
                    </div>
                    <div className="text-xs text-text-secondary truncate mt-1">
                      {chat.lastMessage || 'No messages'}
                    </div>
                  </div>
                  <div className="text-xs text-text-muted">
                    {chat.lastMessageAt && formatMessageTime(chat.lastMessageAt)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Messages View */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-border bg-surface">
              <h2 className="text-lg font-semibold text-text">{selectedChat.name}</h2>
              <p className="text-sm text-text-secondary">
                {selectedChat.type === 'PRIVATE' ? 'Private chat' : 'Group'} • {selectedChat.memberCount} members
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No messages in this chat
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3">
                      <img
                        src={msg.sender?.avatarUrl || '/default-avatar.png'}
                        alt={msg.sender?.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-text">@{msg.sender?.username}</span>
                          <span className="text-xs text-text-muted">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                        <div className="text-text mt-1 break-words">
                          {msg.isDeletedForUsers ? (
                            <span className="italic text-text-muted">[Deleted]</span>
                          ) : (
                            msg.content || (msg.fileUrl ? '📎 File attached' : '')
                          )}
                        </div>
                        {msg.fileUrl && (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            View file
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            Select a chat to view messages
          </div>
        )}
      </div>
    </div>
  );
}