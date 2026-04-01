import { useState, useCallback } from 'react';
import { blockUser, unblockUser, getBlockedUsers, isUserBlocked } from '../utils/api';

export const useBlocks = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlockedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const users = await getBlockedUsers();
      setBlockedUsers(users);
      setError(null);
      return users;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const blockUserById = useCallback(async (userId) => {
    setLoading(true);
    try {
      const result = await blockUser(userId);
      await fetchBlockedUsers(); // Refresh list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBlockedUsers]);

  const unblockUserById = useCallback(async (userId) => {
    setLoading(true);
    try {
      const result = await unblockUser(userId);
      setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIsBlocked = useCallback(async (userId) => {
    try {
      return await isUserBlocked(userId);
    } catch (err) {
      console.error('Failed to check block status:', err);
      return false;
    }
  }, []);

  const isBlocked = useCallback((userId) => {
    return blockedUsers.some(u => u.id === userId);
  }, [blockedUsers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    blockedUsers,
    loading,
    error,
    fetchBlockedUsers,
    blockUser: blockUserById,
    unblockUser: unblockUserById,
    checkIsBlocked,
    isBlocked,
    clearError
  };
};