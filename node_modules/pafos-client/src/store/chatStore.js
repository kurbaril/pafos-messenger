import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      messages: {},
      typingUsers: {},
      loading: false,
      error: null,

      setChats: (chats) => set({ chats }),
      
      addChat: (chat) => set((state) => ({
        chats: [chat, ...state.chats.filter(c => c.id !== chat.id)]
      })),
      
      updateChat: (chatId, updates) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId ? { ...chat, ...updates } : chat
        )
      })),
      
      removeChat: (chatId) => set((state) => ({
        chats: state.chats.filter(chat => chat.id !== chatId),
        messages: {
          ...state.messages,
          [chatId]: undefined
        }
      })),
      
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),
      
      setMessages: (chatId, messages, hasMore = false) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: {
            items: messages,
            hasMore,
            loaded: true
          }
        }
      })),
      
      addMessage: (message) => set((state) => {
        const chatMessages = state.messages[message.chatId]?.items || [];
        const exists = chatMessages.some(m => m.id === message.id);
        
        if (exists) return state;
        
        return {
          messages: {
            ...state.messages,
            [message.chatId]: {
              ...state.messages[message.chatId],
              items: [...chatMessages, message],
              loaded: true
            }
          }
        };
      }),
      
      updateMessage: (messageId, updates) => set((state) => {
        const newMessages = { ...state.messages };
        
        for (const chatId in newMessages) {
          const index = newMessages[chatId]?.items?.findIndex(m => m.id === messageId);
          if (index !== undefined && index !== -1) {
            newMessages[chatId].items[index] = {
              ...newMessages[chatId].items[index],
              ...updates
            };
            break;
          }
        }
        
        return { messages: newMessages };
      }),
      
      deleteMessage: (messageId) => set((state) => {
        const newMessages = { ...state.messages };
        
        for (const chatId in newMessages) {
          newMessages[chatId].items = newMessages[chatId]?.items?.filter(m => m.id !== messageId) || [];
        }
        
        return { messages: newMessages };
      }),
      
      addReaction: (messageId, reaction) => set((state) => {
        const newMessages = { ...state.messages };
        
        for (const chatId in newMessages) {
          const message = newMessages[chatId]?.items?.find(m => m.id === messageId);
          if (message) {
            const existingReaction = message.reactions?.find(r => r.emoji === reaction.emoji && r.userId === reaction.userId);
            if (!existingReaction) {
              message.reactions = [...(message.reactions || []), reaction];
            }
            break;
          }
        }
        
        return { messages: newMessages };
      }),
      
      removeReaction: (messageId, emoji, userId) => set((state) => {
        const newMessages = { ...state.messages };
        
        for (const chatId in newMessages) {
          const message = newMessages[chatId]?.items?.find(m => m.id === messageId);
          if (message) {
            message.reactions = message.reactions?.filter(r => !(r.emoji === emoji && r.userId === userId));
            break;
          }
        }
        
        return { messages: newMessages };
      }),
      
      setTypingUsers: (chatId, userId, isTyping) => set((state) => {
        const current = state.typingUsers[chatId] || [];
        let newTyping;
        
        if (isTyping && !current.includes(userId)) {
          newTyping = [...current, userId];
        } else if (!isTyping && current.includes(userId)) {
          newTyping = current.filter(id => id !== userId);
        } else {
          return state;
        }
        
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: newTyping
          }
        };
      }),
      
      getTypingUsers: (chatId) => {
        const userIds = get().typingUsers[chatId] || [];
        // We need to map to usernames - this will be handled in component
        return userIds;
      },
      
      clearTyping: (chatId) => set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [chatId]: []
        }
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      reset: () => set({
        chats: [],
        currentChatId: null,
        messages: {},
        typingUsers: {},
        loading: false,
        error: null
      })
    }),
    {
      name: 'pafos-chats',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId
      })
    }
  )
);