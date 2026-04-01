import { useState, useCallback, useRef } from 'react';
import { searchMessages, searchChats, searchUsers, globalSearch } from '../utils/api';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    messages: [],
    chats: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState({ messages: false, chats: false, users: false });
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const performSearch = useCallback(async (searchQuery, type = 'all') => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults({ messages: [], chats: [], users: [] });
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      let data;
      if (type === 'messages') {
        data = { messages: await searchMessages(searchQuery), chats: [], users: [] };
      } else if (type === 'chats') {
        data = { messages: [], chats: await searchChats(searchQuery), users: [] };
      } else if (type === 'users') {
        data = { messages: [], chats: [], users: await searchUsers(searchQuery) };
      } else {
        data = await globalSearch(searchQuery);
      }
      
      setResults(data);
      setHasMore({
        messages: data.messages?.length === 50,
        chats: data.chats?.length === 20,
        users: data.users?.length === 20
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMessagesOnly = useCallback(async (searchQuery) => {
    await performSearch(searchQuery, 'messages');
  }, [performSearch]);

  const searchChatsOnly = useCallback(async (searchQuery) => {
    await performSearch(searchQuery, 'chats');
  }, [performSearch]);

  const searchUsersOnly = useCallback(async (searchQuery) => {
    await performSearch(searchQuery, 'users');
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults({ messages: [], chats: [], users: [] });
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    hasMore,
    error,
    performSearch,
    searchMessagesOnly,
    searchChatsOnly,
    searchUsersOnly,
    clearSearch
  };
};