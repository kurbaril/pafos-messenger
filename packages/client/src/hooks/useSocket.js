import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';
import { useChatStore } from '../store/chatStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { 
    addMessage, 
    updateMessage, 
    deleteMessage: deleteMessageFromStore,
    addReaction: addReactionToStore,
    removeReaction: removeReactionFromStore,
    setTypingUsers 
  } = useChatStore();

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
      withCredentials: true,
      auth: {
        sessionID: localStorage.getItem('sessionID')
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Message events
    socket.on('newMessage', (message) => {
      addMessage(message);
      if (message.senderId !== user.id) {
        toast.success(`${message.sender.username}: ${message.content?.substring(0, 50)}`);
      }
    });

    socket.on('messageEdited', (message) => {
      updateMessage(message.id, message);
    });

    socket.on('messageDeleted', ({ messageId }) => {
      deleteMessageFromStore(messageId);
    });

    socket.on('messageRead', ({ messageId, userId }) => {
      updateMessage(messageId, { readBy: [{ userId }] });
    });

    // Typing events
    socket.on('typing:start', ({ userId, chatId }) => {
      setTypingUsers(chatId, userId, true);
    });

    socket.on('typing:stop', ({ userId, chatId }) => {
      setTypingUsers(chatId, userId, false);
    });

    // Reaction events
    socket.on('reactionAdded', ({ messageId, reaction }) => {
      addReactionToStore(messageId, reaction);
    });

    socket.on('reactionRemoved', ({ messageId, emoji, userId }) => {
      removeReactionFromStore(messageId, emoji, userId);
    });

    // Presence events
    socket.on('userOnline', ({ userId }) => {
      // Update user online status
    });

    socket.on('userOffline', ({ userId }) => {
      // Update user offline status
    });

    // Chat events
    socket.on('chatUpdated', ({ chatId }) => {
      window.dispatchEvent(new CustomEvent('refreshChats'));
    });

    socket.on('newChat', ({ chatId }) => {
      window.dispatchEvent(new CustomEvent('refreshChats'));
    });

    // Mention events
    socket.on('mention', ({ messageId, chatId, sender, content }) => {
      toast(
        <div>
          <span className="font-medium">@{sender.username}</span> mentioned you
          <div className="text-xs text-text-secondary">{content}</div>
        </div>,
        { duration: 5000 }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const emit = (event, data, callback) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data, callback);
    }
  };

  const sendMessage = (data, callback) => {
    emit('sendMessage', data, callback);
  };

  const editMessage = (data, callback) => {
    emit('editMessage', data, callback);
  };

  const deleteMessage = (data, callback) => {
    emit('deleteMessage', data, callback);
  };

  const markAsRead = (data, callback) => {
    emit('markAsRead', data, callback);
  };

  const markChatAsRead = (data, callback) => {
    emit('markChatAsRead', data, callback);
  };

  const startTyping = (chatId) => {
    emit('typing:start', { chatId });
  };

  const stopTyping = (chatId) => {
    emit('typing:stop', { chatId });
  };

  const addReaction = (data, callback) => {
    emit('addReaction', data, callback);
  };

  const removeReaction = (data, callback) => {
    emit('removeReaction', data, callback);
  };

  const updatePresence = (status) => {
    emit('presence:update', { status });
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    markChatAsRead,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
    updatePresence,
    emit
  };
};
