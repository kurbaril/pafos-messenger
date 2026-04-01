import { prisma } from '../server.js';

/**
 * Search messages across user's chats
 */
export async function searchMessages(userId, query, options = {}) {
  const {
    chatId = null,
    limit = 50,
    offset = 0,
    fromDate = null,
    toDate = null,
    senderId = null
  } = options;

  if (!query || query.length < 2) {
    return { messages: [], total: 0 };
  }

  // Get user's chats
  const userChats = await prisma.chatUser.findMany({
    where: { userId },
    select: { chatId: true }
  });

  const chatIds = userChats.map(c => c.chatId);

  if (chatIds.length === 0) {
    return { messages: [], total: 0 };
  }

  // Build where clause
  const where = {
    chatId: chatId ? { in: chatIds, equals: chatId } : { in: chatIds },
    content: {
      contains: query,
      mode: 'insensitive'
    },
    isDeletedForUsers: false
  };

  if (fromDate) {
    where.createdAt = { ...where.createdAt, gte: new Date(fromDate) };
  }
  if (toDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(toDate) };
  }
  if (senderId) {
    where.senderId = senderId;
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        chat: {
          include: {
            group: true,
            users: {
              where: { userId },
              take: 1
            }
          }
        },
        reactions: {
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.message.count({ where })
  ]);

  // Format results
  const formattedMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt,
    sender: msg.sender,
    chat: {
      id: msg.chat.id,
      name: msg.chat.group?.name || 'Private Chat',
      type: msg.chat.type
    },
    reactionsCount: msg.reactions.length
  }));

  return {
    messages: formattedMessages,
    total,
    hasMore: total > offset + limit
  };
}

/**
 * Search chats by name
 */
export async function searchChats(userId, query) {
  if (!query || query.length < 2) {
    return [];
  }

  const userChats = await prisma.chat.findMany({
    where: {
      users: { some: { userId } },
      OR: [
        // Search group names
        {
          group: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        // Search private chat usernames
        {
          type: 'PRIVATE',
          users: {
            some: {
              user: {
                username: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              NOT: { userId }
            }
          }
        }
      ]
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
      group: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    take: 20
  });

  return userChats.map(chat => {
    const otherUser = chat.type === 'PRIVATE'
      ? chat.users.find(u => u.userId !== userId)?.user
      : null;

    return {
      id: chat.id,
      type: chat.type,
      name: chat.type === 'PRIVATE' ? otherUser?.username : chat.group?.name,
      avatar: chat.type === 'PRIVATE' ? otherUser?.avatarUrl : chat.group?.avatarUrl,
      lastMessage: chat.messages[0]?.content,
      updatedAt: chat.updatedAt
    };
  });
}

/**
 * Search users (global)
 */
export async function searchUsers(userId, query, excludeBlocked = true) {
  if (!query || query.length < 2) {
    return [];
  }

  const where = {
    username: {
      contains: query,
      mode: 'insensitive'
    },
    id: { not: userId },
    isBanned: false
  };

  if (excludeBlocked) {
    const blocked = await prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true }
    });
    const blockedIds = blocked.map(b => b.blockedId);
    if (blockedIds.length > 0) {
      where.id = { ...where.id, notIn: blockedIds };
    }
  }

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true
    },
    take: 20
  });
}

/**
 * Global search (messages + chats + users)
 */
export async function globalSearch(userId, query) {
  if (!query || query.length < 2) {
    return { messages: [], chats: [], users: [] };
  }

  const [messages, chats, users] = await Promise.all([
    searchMessages(userId, query, { limit: 10 }),
    searchChats(userId, query),
    searchUsers(userId, query)
  ]);

  return {
    messages: messages.messages,
    chats,
    users
  };
}

/**
 * Index message for faster search (can be extended with Elasticsearch)
 */
export async function indexMessage(messageId) {
  // For now, just return the message
  // This can be extended to use Elasticsearch or other search engines
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });
  return message;
}

/**
 * Remove message from search index
 */
export async function removeFromIndex(messageId) {
  // Placeholder for removing from search index
  return true;
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(userId, query) {
  if (!query || query.length < 2) {
    return { users: [], chats: [] };
  }

  const [users, chats] = await Promise.all([
    prisma.user.findMany({
      where: {
        username: {
          startsWith: query,
          mode: 'insensitive'
        },
        id: { not: userId },
        isBanned: false
      },
      select: {
        username: true,
        avatarUrl: true
      },
      take: 5
    }),
    prisma.chat.findMany({
      where: {
        users: { some: { userId } },
        OR: [
          { group: { name: { startsWith: query, mode: 'insensitive' } } },
          {
            type: 'PRIVATE',
            users: {
              some: {
                user: {
                  username: { startsWith: query, mode: 'insensitive' }
                },
                NOT: { userId }
              }
            }
          }
        ]
      },
      include: {
        group: true,
        users: {
          where: { NOT: { userId } },
          include: {
            user: {
              select: { username: true }
            }
          },
          take: 1
        }
      },
      take: 5
    })
  ]);

  const formattedChats = chats.map(chat => ({
    name: chat.group?.name || chat.users[0]?.user.username,
    type: chat.type,
    id: chat.id
  }));

  return {
    users: users.map(u => ({ username: u.username, avatarUrl: u.avatarUrl })),
    chats: formattedChats
  };
}