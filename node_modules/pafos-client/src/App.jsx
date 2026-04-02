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
export const getProfile = async () => {
  return fetchWithAuth('/api/profile');
};

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
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
};

export const deleteAvatar = async () => {
  return fetchWithAuth('/api/profile/avatar', { method: 'DELETE' });
};

// Chats
export const getChats = async () => {
  return fetchWithAuth('/api/chats');
};

export const getChatMessages = async (chatId, cursor = null, limit = 50) => {
  const params = new URLSearchParams({ limit });
  if (cursor) params.append('cursor', cursor);
  return fetchWithAuth(`/api/chats/${chatId}/messages?${params}`);
};

export const createPrivateChat = async (userId) => {
  return fetchWithAuth(`/api/chats/private/${userId}`, { method: 'POST' });
};

export const searchUsers = async (query) => {
  return fetchWithAuth(`/api/chats/search/users?q=${encodeURIComponent(query)}`);
};

// Groups
export const createGroup = async (name, description, memberIds) => {
  return fetchWithAuth('/api/groups', {
    method: 'POST',
    body: JSON.stringify({ name, description, memberIds })
  });
};

export const getGroup = async (groupId) => {
  return fetchWithAuth(`/api/groups/${groupId}`);
};

export const updateGroup = async (groupId, data) => {
  return fetchWithAuth(`/api/groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const addGroupMember = async (groupId, userId) => {
  return fetchWithAuth(`/api/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
};

export const removeGroupMember = async (groupId, userId) => {
  return fetchWithAuth(`/api/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
};

// Messages
export const editMessage = async (messageId, content) => {
  return fetchWithAuth(`/api/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  });
};

export const deleteMessage = async (messageId) => {
  return fetchWithAuth(`/api/messages/${messageId}`, { method: 'DELETE' });
};

export const getMessageInfo = async (messageId) => {
  return fetchWithAuth(`/api/messages/${messageId}`);
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

export const getMessageReadReceipts = async (messageId) => {
  return fetchWithAuth(`/api/messages/${messageId}/read-receipts`);
};

// Search
export const searchMessages = async (query, chatId = null) => {
  const params = new URLSearchParams({ q: query });
  if (chatId) params.append('chatId', chatId);
  return fetchWithAuth(`/api/search/messages?${params}`);
};

export const searchChats = async (query) => {
  return fetchWithAuth(`/api/search/chats?q=${encodeURIComponent(query)}`);
};

export const globalSearch = async (query) => {
  return fetchWithAuth(`/api/search/global?q=${encodeURIComponent(query)}`);
};

// Pinned
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

// Uploads
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData
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
    credentials: 'include',
    body: formData
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
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
};