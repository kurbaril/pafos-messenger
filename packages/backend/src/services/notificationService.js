import webpush from 'web-push';
import { prisma } from '../server.js';

// Configure web push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@pafos.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

/**
 * Send push notification to a user
 */
export async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true }
    });
    
    if (!user?.pushToken) return false;
    
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data
    });
    
    await webpush.sendNotification(
      JSON.parse(user.pushToken),
      payload
    );
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    // If token is expired, remove it
    if (error.statusCode === 410) {
      await prisma.user.update({
        where: { id: userId },
        data: { pushToken: null }
      });
    }
    return false;
  }
}

/**
 * Create in-app notification
 */
export async function createInAppNotification(userId, type, content, data = {}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        content,
        data
      }
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Send message notification
 */
export async function notifyNewMessage(userId, senderName, chatId, messagePreview) {
  // Send push notification
  await sendPushNotification(
    userId,
    senderName,
    messagePreview,
    { chatId, type: 'message' }
  );
  
  // Create in-app notification
  await createInAppNotification(
    userId,
    'message',
    `${senderName}: ${messagePreview}`,
    { chatId, senderName }
  );
}

/**
 * Send mention notification
 */
export async function notifyMention(userId, senderName, chatId, messageId, messagePreview) {
  // Send push notification
  await sendPushNotification(
    userId,
    `Mention from ${senderName}`,
    messagePreview,
    { chatId, messageId, type: 'mention' }
  );
  
  // Create in-app notification
  await createInAppNotification(
    userId,
    'mention',
    `${senderName} mentioned you: ${messagePreview}`,
    { chatId, messageId, senderName }
  );
}

/**
 * Send reaction notification
 */
export async function notifyReaction(userId, senderName, messagePreview, emoji) {
  // Send push notification
  await sendPushNotification(
    userId,
    `${senderName} reacted ${emoji}`,
    messagePreview,
    { type: 'reaction', emoji }
  );
  
  // Create in-app notification
  await createInAppNotification(
    userId,
    'reaction',
    `${senderName} reacted ${emoji} to your message: ${messagePreview}`,
    { emoji, senderName }
  );
}

/**
 * Send group invite notification
 */
export async function notifyGroupInvite(userId, groupName, groupId, inviterName) {
  // Send push notification
  await sendPushNotification(
    userId,
    `Invited to group: ${groupName}`,
    `${inviterName} added you to ${groupName}`,
    { groupId, type: 'group_invite' }
  );
  
  // Create in-app notification
  await createInAppNotification(
    userId,
    'group_invite',
    `${inviterName} added you to group "${groupName}"`,
    { groupId, groupName, inviterName }
  );
}

/**
 * Get user's unread notifications count
 */
export async function getUnreadNotificationCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(userId, limit = 50, offset = 0) {
  try {
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.notification.count({ where: { userId } })
    ]);
    
    return { notifications, total };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { notifications: [], total: 0 };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId, userId) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: { isRead: true }
    });
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId, userId) {
  try {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

/**
 * Save push subscription for user
 */
export async function savePushSubscription(userId, subscription) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { pushToken: JSON.stringify(subscription) }
    });
    
    return true;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return false;
  }
}

/**
 * Remove push subscription
 */
export async function removePushSubscription(userId) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { pushToken: null }
    });
    
    return true;
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return false;
  }
}