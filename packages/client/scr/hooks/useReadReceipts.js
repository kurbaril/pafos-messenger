import { useState, useCallback } from 'react';
import { getMessageReadReceipts, markMessageRead } from '../api';
import { useSocket } from './useSocket';

export const useReadReceipts = () => {
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [readReceipts, setReadReceipts] = useState(null);

  const fetchReadReceipts = useCallback(async (messageId) => {
    setLoading(true);
    try {
      const data = await getMessageReadReceipts(messageId);
      setReadReceipts(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch read receipts:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (messageId, chatId) => {
    try {
      await markMessageRead(messageId);
      
      // Emit via socket for real-time update
      if (socket) {
        socket.emit('markAsRead', { messageId, chatId });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      return false;
    }
  }, [socket]);

  const markChatAsRead = useCallback(async (chatId) => {
    try {
      if (socket) {
        socket.emit('markChatAsRead', { chatId });
      }
      return true;
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
      return false;
    }
  }, [socket]);

  const getReadStatus = useCallback((message, currentUserId) => {
    if (!message) return { isRead: false, readCount: 0, isFullyRead: false };
    
    const readCount = message.readBy?.length || 0;
    const totalMembers = message.chat?.users?.length || 2;
    const isFullyRead = readCount === totalMembers - 1;
    const isReadByMe = message.readBy?.some(r => r.userId === currentUserId);
    
    return {
      isRead: readCount > 0,
      readCount,
      totalMembers: totalMembers - 1,
      isFullyRead,
      isReadByMe
    };
  }, []);

  const getReadReceiptsList = useCallback(async (messageId) => {
    const data = await fetchReadReceipts(messageId);
    if (data) {
      return {
        readBy: data.readBy || [],
        readCount: data.readCount || 0,
        totalMembers: data.totalMembers || 0,
        isFullyRead: data.isFullyRead || false
      };
    }
    return null;
  }, [fetchReadReceipts]);

  return {
    loading,
    readReceipts,
    fetchReadReceipts,
    markAsRead,
    markChatAsRead,
    getReadStatus,
    getReadReceiptsList
  };
};