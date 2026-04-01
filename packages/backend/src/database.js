import { prisma } from './server.js';

/**
 * Получить или создать приватный чат между двумя пользователями
 */
export async function getOrCreatePrivateChat(userId1, userId2) {
  // Проверяем блокировку
  const [block1, block2] = await Promise.all([
    prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId1,
          blockedId: userId2
        }
      }
    }),
    prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId2,
          blockedId: userId1
        }
      }
    })
  ]);

  if (block1 || block2) {
    throw new Error('User is blocked');
  }

  // Ищем существующий чат
  const existingChat = await prisma.chat.findFirst({
    where: {
      type: 'PRIVATE',
      users: {
        every: {
          userId: { in: [userId1, userId2] }
        }
      }
    },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      }
    }
  });

  if (existingChat) return existingChat;

  // Создаём новый чат
  const chat = await prisma.chat.create({
    data: {
      type: 'PRIVATE',
      users: {
        create: [
          { userId: userId1 },
          { userId: userId2 }
        ]
      }
    },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      }
    }
  });

  return chat;
}

/**
 * Получить все чаты пользователя с последним сообщением
 */
export async function getUserChats(userId) {
  const chats = await prisma.chat.findMany({
    where: {
      users: {
        some: { userId }
      }
    },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      },
      group: true,
      pinned: {
        include: {
          message: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  // Получаем количество непрочитанных сообщений
  const unreadCounts = await getUnreadCounts(userId, chats.map(c => c.id));

  return chats.map(chat => {
    const otherUser = chat.type === 'PRIVATE'
      ? chat.users.find(u => u.userId !== userId)?.user
      : null;

    return {
      id: chat.id,
      type: chat.type,
      name: chat.type === 'PRIVATE' ? otherUser?.username : chat.group?.name,
      avatar: chat.type === 'PRIVATE' ? otherUser?.avatarUrl : chat.group?.avatarUrl,
      lastMessage: chat.messages[0] || null,
      unreadCount: unreadCounts[chat.id] || 0,
      updatedAt: chat.updatedAt,
      pinnedMessage: chat.pinned?.message || null
    };
  });
}

/**
 * Получить количество непрочитанных сообщений
 */
async function getUnreadCounts(userId, chatIds) {
  if (!chatIds.length) return {};

  const lastRead = await prisma.messageRead.groupBy({
    by: ['messageId'],
    where: {
      userId,
      message: {
        chatId: { in: chatIds }
      }
    }
  });

  const readMessageIds = lastRead.map(r => r.messageId);

  const unreadCounts = await prisma.message.groupBy({
    by: ['chatId'],
    where: {
      chatId: { in: chatIds },
      id: { notIn: readMessageIds },
      senderId: { not: userId },
      isDeletedForUsers: false
    },
    _count: {
      id: true
    }
  });

  const result = {};
  unreadCounts.forEach(count => {
    result[count.chatId] = count._count.id;
  });

  return result;
}

/**
 * Получить сообщения чата с пагинацией
 */
export async function getChatMessages(chatId, userId, limit = 50, cursor = null) {
  const messages = await prisma.message.findMany({
    where: {
      chatId,
      ...(cursor && { createdAt: { lt: new Date(cursor) } })
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true
        }
      },
      quoted: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        }
      },
      readBy: {
        where: { userId },
        take: 1
      },
      editHistory: {
        orderBy: { editedAt: 'desc' },
        take: 5
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1
  });

  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, -1) : messages;
  const nextCursor = hasMore ? items[items.length - 1]?.createdAt : null;

  return {
    messages: items.reverse(),
    hasMore,
    nextCursor
  };
}

/**
 * Сохранить сообщение
 */
export async function saveMessage(chatId, senderId, content, fileData = null, quotedId = null) {
  const data = {
    content,
    senderId,
    chatId,
    quotedId
  };

  if (fileData) {
    data.fileUrl = fileData.url;
    data.fileType = fileData.type;
    data.fileName = fileData.name;
    data.fileSize = fileData.size;
    data.duration = fileData.duration;
  }

  const message = await prisma.message.create({
    data,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true
        }
      },
      quoted: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      }
    }
  });

  // Обновляем время чата
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() }
  });

  // Отмечаем сообщение как прочитанное отправителем
  await markMessageAsRead(message.id, senderId);

  return message;
}

/**
 * Отметить сообщение как прочитанное
 */
export async function markMessageAsRead(messageId, userId) {
  try {
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId
        }
      },
      update: { readAt: new Date() },
      create: {
        messageId,
        userId
      }
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

/**
 * Отметить все сообщения в чате как прочитанные
 */
export async function markChatAsRead(chatId, userId) {
  const messages = await prisma.message.findMany({
    where: {
      chatId,
      senderId: { not: userId },
      isDeletedForUsers: false,
      readBy: {
        none: { userId }
      }
    },
    select: { id: true }
  });

  if (messages.length === 0) return;

  await prisma.messageRead.createMany({
    data: messages.map(msg => ({
      messageId: msg.id,
      userId
    })),
    skipDuplicates: true
  });
}

/**
 * Редактировать сообщение
 */
export async function editMessage(messageId, userId, newContent) {
  const message = await prisma.message.findUnique({
    where: { id: messageId }
  });

  if (!message || message.senderId !== userId) {
    throw new Error('Not authorized to edit this message');
  }

  // Сохраняем историю правок
  if (message.content) {
    await prisma.messageEdit.create({
      data: {
        messageId,
        oldContent: message.content,
        newContent,
        editedBy: userId
      }
    });
  }

  // Обновляем сообщение
  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: newContent,
      editedAt: new Date()
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true
        }
      }
    }
  });

  return updated;
}

/**
 * Удалить сообщение для всех
 */
export async function deleteMessageForEveryone(messageId, userId, userRole) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { chat: true }
  });

  if (!message) throw new Error('Message not found');

  // Только автор или админ могут удалить
  if (message.senderId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  // Сохраняем лог для админа
  await prisma.deletedMessageLog.create({
    data: {
      messageId,
      deletedBy: userId,
      messageData: {
        content: message.content,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        createdAt: message.createdAt,
        senderId: message.senderId
      }
    }
  });

  // Помечаем как удалённое
  const deleted = await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeletedForUsers: true,
      deletedAt: new Date(),
      deletedBy: userId
    }
  });

  return deleted;
}