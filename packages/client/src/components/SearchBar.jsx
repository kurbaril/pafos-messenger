import React, { useState, useRef, useEffect } from 'react';
import { searchMessages, searchChats, searchUsers } from '../api';
import SearchResults from './SearchResults';
import Avatar from './Avatar';

export default function SearchBar({ onSelectChat, onSelectUser }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({ messages: [], chats: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults({ messages: [], chats: [], users: [] });
        return;
      }

      setLoading(true);
      try {
        const [messages, chats, users] = await Promise.all([
          searchMessages(query),
          searchChats(query),
          searchUsers(query)
        ]);
        setResults({ messages, chats, users });
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'messages', label: 'Messages' },
    { id: 'chats', label: 'Chats' },
    { id: 'users', label: 'Users' }
  ];

  const getTabResults = () => {
    switch (activeTab) {
      case 'messages': return results.messages;
      case 'chats': return results.chats;
      case 'users': return results.users;
      default: return [...results.messages, ...results.chats, ...results.users];
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages, chats, users..."
          className="w-full pl-9 pr-4 py-2 bg-surface-hover border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-text placeholder-text-muted"
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {tab.label}
                {tab.id !== 'all' && results[tab.id]?.length > 0 && (
                  <span className="ml-1 text-xs">({results[tab.id].length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="p-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <SearchResults
                results={getTabResults()}
                activeTab={activeTab}
                onSelectChat={(chat) => {
                  onSelectChat?.(chat);
                  setIsOpen(false);
                  setQuery('');
                }}
                onSelectUser={(user) => {
                  onSelectUser?.(user);
                  setIsOpen(false);
                  setQuery('');
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}