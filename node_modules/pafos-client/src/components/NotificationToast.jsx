import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function NotificationToast() {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const showToast = (notification) => {
      const toastId = toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-slideIn' : 'animate-slideOut'
            } bg-surface border border-border rounded-lg shadow-lg p-2 max-w-sm w-full cursor-pointer hover:bg-surface-hover transition-colors`}
            onClick={() => {
              toast.dismiss(toastId);
              handleNotificationClick(notification);
            }}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                {notification.type === 'message' && (
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
                {notification.type === 'mention' && (
                  <svg className="w-3 h-3 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {notification.type === 'reaction' && (
                  <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                )}
                {notification.type === 'group_invite' && (
                  <svg className="w-3 h-3 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text">{notification.title}</p>
                <p className="text-xs text-text-secondary truncate">{notification.body}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(toastId);
                }}
                className="flex-shrink-0 text-text-muted hover:text-text"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: 'bottom-right'
        }
      );
    };

    notifications.forEach(notification => {
      if (!notification.isRead) {
        showToast(notification);
        markAsRead(notification.id);
      }
    });
  }, [notifications, markAsRead]);

  const handleNotificationClick = (notification) => {
    if (notification.data?.chatId) {
      navigate(`/chats/${notification.data.chatId}`);
    } else if (notification.data?.groupId) {
      navigate(`/chats/${notification.data.groupId}`);
    }
  };

  return null;
}