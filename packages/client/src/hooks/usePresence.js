import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';

export const usePresence = () => {
  const { socket, isConnected, updatePresence: socketUpdatePresence } = useSocket();
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [status, setStatus] = useState('online');

  // Update presence when connection status changes
  useEffect(() => {
    if (isConnected && user) {
      socketUpdatePresence('online');
    }
  }, [isConnected, user, socketUpdatePresence]);

  // Listen for presence updates
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, { status: 'online', lastSeen: new Date() });
        return newMap;
      });
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, { status: 'offline', lastSeen: new Date() });
        return newMap;
      });
    };

    const handlePresenceChanged = ({ userId, status, lastSeen }) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, { status, lastSeen: new Date(lastSeen) });
        return newMap;
      });
    };

    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('presence:changed', handlePresenceChanged);

    return () => {
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('presence:changed', handlePresenceChanged);
    };
  }, [socket]);

  const getUserStatus = useCallback((userId) => {
    const presence = onlineUsers.get(userId);
    if (!presence) return { status: 'offline', lastSeen: null, isOnline: false };
    
    const isOnline = presence.status === 'online' && 
      (new Date() - new Date(presence.lastSeen)) < 5 * 60 * 1000;
    
    return {
      status: isOnline ? 'online' : presence.status,
      lastSeen: presence.lastSeen,
      isOnline
    };
  }, [onlineUsers]);

  const formatLastSeen = useCallback((lastSeen) => {
    if (!lastSeen) return 'never';
    
    const now = new Date();
    const seen = new Date(lastSeen);
    const diff = now - seen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return seen.toLocaleDateString();
  }, []);

  const setUserStatus = useCallback((newStatus) => {
    setStatus(newStatus);
    socketUpdatePresence(newStatus);
  }, [socketUpdatePresence]);

  return {
    onlineUsers: Array.from(onlineUsers.entries()).map(([id, data]) => ({ userId: id, ...data })),
    getUserStatus,
    formatLastSeen,
    status,
    setStatus: setUserStatus,
    isOnline: (userId) => getUserStatus(userId).isOnline
  };
};