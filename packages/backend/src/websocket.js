import { prisma } from './server.js';
import { saveMessage, markMessageAsRead, markChatAsRead, deleteMessageForEveryone, editMessage } from './database.js';
import { getUserPresence, updateUserPresence } from './auth.js';
import { sessionMiddleware } from './server.js';

const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId
const userTyping = new Map(); // userId -> { chatId, timeout }

export function setupWebSocket(io) {
  // Wrap socket.io with session middleware
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', async (socket) => {
    const session = socket.request.session;
    const userId = session?.userId;
    
    if (!userId) {
      console.log('WebSocket connection rejected: no userId in session');
      socket.disconnect();
      return;
    }

    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBanned: true }
    });

    if (user?.isBanned) {
      socket.disconnect();
      return;
    }

    // Store connection
    const oldSocketId = userSockets.get(userId);
    if (oldSocketId && oldSocketId !== socket.id) {
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect();
      }
    }
    
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);

    // Update user presence
    await updateUserPresence(userId, 'online');
    
    // Broadcast online status to friends
    socket.broadcast.emit('userOnline', { userId });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Get user's chats and join rooms
    const userChats = await prisma.chat.findMany({
      where: {
        users: { some: { userId } }
      },
      select: { id: true }
    });

    userChats.forEach(chat => {
      socket.join(`chat:${chat.id}`);
    });

    console.log(`📱 User ${userId} connected (${socket.id})`);

    // ========== MESSAGE HANDLERS ==========

    // Send message
    socket.on('sendMessage', async ({ chatId, content, recipientId, replyToId, fileData }, callback) => {
      try {
        let targetChatId = chatId;

        // Check if recipient is blocked
        if (recipientId) {
          const block = await prisma.userBlock.findFirst({
            where: {
              OR: [
                { blockerId: userId, blockedId: recipientId },
                { blockerId: recipientId, blockedId: userId }
              ]
            }
          });
          
          if (block) {
            callback({ error: 'User is blocked' });
            return;
          }
        }

        // Create new private chat if needed
        if (!targetChatId && recipientId) {
          const existingChat = await prisma.chat.findFirst({
            where: {
              type: 'PRIVATE',
              users: {
                every: {
                  userId: { in: [userId, recipientId] }
                }
              }
            }
          });

          if (existingChat) {
            targetChatId = existingChat.id;
          } else {
            const newChat = await prisma.chat.create({
              data: {
                type: 'PRIVATE',
                users: {
                  create: [
                    { userId },
                    { userId: recipientId }
                  ]
                }
              }
            });
            targetChatId = newChat.id;
          }

          socket.join(`chat:${targetChatId}`);
          
          const recipientSocketId = userSockets.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('newChat', { chatId: targetChatId });
          }
        }

        // Save message
        const message = await saveMessage(targetChatId, userId, content, fileData, replyToId);

        // Check for mentions (@username)
        if (content) {
          const mentionRegex = /@(\w+)/g;
          let match;
          const mentionedUsernames = [];
          
          while ((match = mentionRegex.exec(content)) !== null) {
            mentionedUsernames.push(match[1]);
          }
          
          if (mentionedUsernames.length > 0) {
            const mentionedUsers = await prisma.user.findMany({
              where: {
                username: { in: mentionedUsernames },
                NOT: { id: userId }
              }
            });
            
            for (const mentioned of mentionedUsers) {
              const isInChat = await prisma.chatUser.findUnique({
                where: {
                  userId_chatId: {
                    userId: mentioned.id,
                    chatId: targetChatId
                  }
                }
              });
              
              if (isInChat) {
                await prisma.mention.create({
                  data: {
                    messageId: message.id,
                    userId: mentioned.id
                  }
                });
                
                await prisma.notification.create({
                  data: {
                    userId: mentioned.id,
                    type: 'mention',
                    content: `${message.sender.username} mentioned you: ${content.substring(0, 100)}`,
                    data: {
                      messageId: message.id,
                      chatId: targetChatId,
                      senderId: userId
                    }
                  }
                });
                
                const mentionedSocketId = userSockets.get(mentioned.id);
                if (mentionedSocketId) {
                  io.to(mentionedSocketId).emit('mention', {
                    messageId: message.id,
                    chatId: targetChatId,
                    sender: message.sender,
                    content: content.substring(0, 100)
                  });
                }
              }
            }
          }
        }

        // Broadcast to chat room
        io.to(`chat:${targetChatId}`).emit('newMessage', message);

        // Update chat list for all participants
        const chatUsers = await prisma.chatUser.findMany({
          where: { chatId: targetChatId },
          select: { userId: true }
        });

        chatUsers.forEach(({ userId: uid }) => {
          const socketId = userSockets.get(uid);
          if (socketId) {
            io.to(socketId).emit('chatUpdated', { chatId: targetChatId });
          }
        });

        callback({ success: true, message });
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ error: error.message || 'Failed to send message' });
      }
    });

    // Edit message
    socket.on('editMessage', async ({ messageId, newContent }, callback) => {
      try {
        const updated = await editMessage(messageId, userId, newContent);
        
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { chatId: true }
        });
        
        io.to(`chat:${message.chatId}`).emit('messageEdited', updated);
        callback({ success: true, message: updated });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    // Delete message
    socket.on('deleteMessage', async ({ messageId }, callback) => {
      try {
        const session = socket.request.session;
        const userRole = session?.userRole;
        
        const deleted = await deleteMessageForEveryone(messageId, userId, userRole);
        
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { chatId: true }
        });
        
        io.to(`chat:${message.chatId}`).emit('messageDeleted', { 
          messageId,
          isDeletedForUsers: true
        });
        
        callback({ success: true });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    // Mark as read
    socket.on('markAsRead', async ({ messageId, chatId }, callback) => {
      try {
        await markMessageAsRead(messageId, userId);
        
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { senderId: true, chatId: true }
        });
        
        if (message && message.senderId !== userId) {
          const senderSocketId = userSockets.get(message.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageRead', { 
              messageId, 
              userId,
              chatId: message.chatId
            });
          }
        }
        
        callback({ success: true });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    // Mark chat as read
    socket.on('markChatAsRead', async ({ chatId }, callback) => {
      try {
        await markChatAsRead(chatId, userId);
        
        const messages = await prisma.message.findMany({
          where: {
            chatId,
            senderId: { not: userId },
            isDeletedForUsers: false
          },
          select: { id: true, senderId: true }
        });
        
        const senderIds = [...new Set(messages.map(m => m.senderId))];
        for (const senderId of senderIds) {
          const senderSocketId = userSockets.get(senderId);
          if (senderSocketId) {
            const readMessages = messages.filter(m => m.senderId === senderId);
            io.to(senderSocketId).emit('chatRead', {
              chatId,
              userId,
              messageIds: readMessages.map(m => m.id)
            });
          }
        }
        
        callback({ success: true });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    // ========== TYPING HANDLERS ==========

    socket.on('typing:start', ({ chatId }) => {
      const existing = userTyping.get(userId);
      if (existing && existing.timeout) {
        clearTimeout(existing.timeout);
      }
      
      const timeout = setTimeout(() => {
        socket.to(`chat:${chatId}`).emit('typing:stop', { userId, chatId });
        userTyping.delete(userId);
      }, 3000);
      
      userTyping.set(userId, { chatId, timeout });
      socket.to(`chat:${chatId}`).emit('typing:start', { userId, chatId });
    });

    socket.on('typing:stop', ({ chatId }) => {
      const existing = userTyping.get(userId);
      if (existing && existing.timeout) {
        clearTimeout(existing.timeout);
      }
      userTyping.delete(userId);
      socket.to(`chat:${chatId}`).emit('typing:stop', { userId, chatId });
    });

    // ========== REACTION HANDLERS ==========

    socket.on('addReaction', async ({ messageId, emoji }, callback) => {
      try {
        const reaction = await prisma.reaction.upsert({
          where: {
            messageId_userId_emoji: {
              messageId,
              userId,
              emoji
            }
          },
          update: {},
          create: {
            messageId,
            userId,
            emoji
          },
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        });
        
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { chatId: true, senderId: true }
        });
        
        io.to(`chat:${message.chatId}`).emit('reactionAdded', {
          messageId,
          reaction: {
            emoji,
            userId,
            username: reaction.user.username
          }
        });
        
        callback({ success: true });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on('removeReaction', async ({ messageId, emoji }, callback) => {
      try {
        await prisma.reaction.delete({
          where: {
            messageId_userId_emoji: {
              messageId,
              userId,
              emoji
            }
          }
        });
        
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { chatId: true }
        });
        
        io.to(`chat:${message.chatId}`).emit('reactionRemoved', {
          messageId,
          emoji,
          userId
        });
        
        callback({ success: true });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    // ========== PRESENCE HANDLERS ==========

    socket.on('presence:update', async ({ status }) => {
      await updateUserPresence(userId, status);
      socket.broadcast.emit('presence:changed', { userId, status });
    });

    socket.on('getPresence', async ({ userIds }, callback) => {
      const presences = {};
      for (const uid of userIds) {
        presences[uid] = await getUserPresence(uid);
      }
      callback(presences);
    });

    // ========== DISCONNECT ==========

    socket.on('disconnect', async () => {
      const userId = socketUsers.get(socket.id);
      if (userId) {
        userSockets.delete(userId);
        socketUsers.delete(socket.id);
        
        const typing = userTyping.get(userId);
        if (typing && typing.timeout) {
          clearTimeout(typing.timeout);
        }
        userTyping.delete(userId);
        
        await updateUserPresence(userId, 'offline');
        
        socket.broadcast.emit('userOffline', { userId });
        console.log(`📱 User ${userId} disconnected`);
      }
    });
  });
}