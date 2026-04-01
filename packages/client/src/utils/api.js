const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
};

// Auth
export const login = async (username, password) => {
  return fetchWithAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const register = async (username, password) => {
  return fetchWithAuth('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const logout = async () => {
  return fetchWithAuth('/api/auth/logout', { method: 'POST' });
};

export const getMe = async () => {
  return fetchWithAuth('/api/auth/me');
};

// Profile
export const updateProfile = async (data) => {
  return fetchWithAuth('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(`${API_URL}/api/profile/avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
};

// Chats
export const getChats = async () => {
  return fetchWithAuth('/api/chats');
};

export const getChatMessages = async (chatId, limit = 50, cursor = null) => {
  const params = new URLSearchParams({ limit });
  if (cursor) params.append('cursor', cursor);
  return fetchWithAuth(`/api/chats/${chatId}/messages?${params}`);
};

export const createPrivateChat = async (userId) => {
  return fetchWithAuth(`/api/chats/private/${userId}`, { method: 'POST' });
};

// Messages
export const sendMessage = async (chatId, content, fileData, replyToId) => {
  return fetchWithAuth('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ chatId, content, fileData, replyToId })
  });
};

export const editMessage = async (messageId, content) => {
  return fetchWithAuth(`/api/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  });
};

export const deleteMessage = async (messageId) => {
  return fetchWithAuth(`/api/messages/${messageId}`, { method: 'DELETE' });
};

export const addReaction = async (messageId, emoji) => {
  return fetchWithAuth(`/api/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji })
  });
};

export const removeReaction = async (messageId, emoji) => {
  return fetchWithAuth(`/api/messages/${messageId}/reactions/${emoji}`, { method: 'DELETE' });
};

export const markMessageRead = async (messageId) => {
  return fetchWithAuth(`/api/messages/${messageId}/read`, { method: 'POST' });
};

// Groups
export const createGroup = async (name, description, memberIds) => {
  return fetchWithAuth('/api/groups', {
    method: 'POST',
    body: JSON.stringify({ name, description, memberIds })
  });
};

// Search
export const searchMessages = async (query, chatId) => {
  const params = new URLSearchParams({ q: query });
  if (chatId) params.append('chatId', chatId);
  return fetchWithAuth(`/api/search/messages?${params}`);
};

export const searchChats = async (query) => {
  return fetchWithAuth(`/api/search/chats?q=${encodeURIComponent(query)}`);
};

export const searchUsers = async (query) => {
  return fetchWithAuth(`/api/search/users?q=${encodeURIComponent(query)}`);
};

export const globalSearch = async (query) => {
  return fetchWithAuth(`/api/search/global?q=${encodeURIComponent(query)}`);
};

// Upload
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/upload/file`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
};

export const uploadVoice = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/upload/voice`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
};

// Blocks
export const blockUser = async (userId) => {
  return fetchWithAuth(`/api/blocks/${userId}`, { method: 'POST' });
};

export const unblockUser = async (userId) => {
  return fetchWithAuth(`/api/blocks/${userId}`, { method: 'DELETE' });
};

export const getBlockedUsers = async () => {
  return fetchWithAuth('/api/blocks');
};

export const isUserBlocked = async (userId) => {
  return fetchWithAuth(`/api/blocks/check/${userId}`);
};

// Notifications
export const getNotifications = async () => {
  return fetchWithAuth('/api/notifications');
};

export const markNotificationRead = async (notificationId) => {
  return fetchWithAuth(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
};

export const markAllNotificationsRead = async () => {
  return fetchWithAuth('/api/notifications/read-all', { method: 'PUT' });
};

export const getUnreadCount = async () => {
  return fetchWithAuth('/api/notifications/unread/count');
};

// Read receipts
export const getMessageReadReceipts = async (messageId) => {
  return fetchWithAuth(`/api/messages/${messageId}/read-receipts`);
};

// Pinned messages
export const pinMessage = async (chatId, messageId) => {
  return fetchWithAuth(`/api/pinned/${chatId}`, {
    method: 'POST',
    body: JSON.stringify({ messageId })
  });
};

export const unpinMessage = async (chatId) => {
  return fetchWithAuth(`/api/pinned/${chatId}`, { method: 'DELETE' });
};

export const getPinnedMessage = async (chatId) => {
  return fetchWithAuth(`/api/pinned/${chatId}`);
};

// Mentions
export const getMentions = async () => {
  return fetchWithAuth('/api/mentions');
};

export const markMentionRead = async (mentionId) => {
  return fetchWithAuth(`/api/mentions/${mentionId}/read`, { method: 'PUT' });
};