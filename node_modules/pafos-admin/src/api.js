const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '/admin/super-secret-pafos-2024';

const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${ADMIN_SECRET}${endpoint}`, {
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
export const getMe = async () => {
  return fetchWithAuth('/api/auth/me');
};

// Stats
export const getStats = async () => {
  return fetchWithAuth('/api/admin/stats');
};

// Users
export const getUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`/api/admin/users${query ? `?${query}` : ''}`);
};

export const banUser = async (userId, reason) => {
  return fetchWithAuth(`/api/admin/users/${userId}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
};

export const unbanUser = async (userId) => {
  return fetchWithAuth(`/api/admin/users/${userId}/unban`, {
    method: 'POST'
  });
};

export const getUserDetails = async (userId) => {
  return fetchWithAuth(`/api/admin/users/${userId}`);
};

// Chats
export const getChats = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`/api/admin/chats${query ? `?${query}` : ''}`);
};

export const getChatMessages = async (chatId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`/api/admin/chats/${chatId}/messages${query ? `?${query}` : ''}`);
};

// Messages
export const getDeletedMessages = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`/api/admin/deleted-messages${query ? `?${query}` : ''}`);
};

export const restoreMessage = async (logId) => {
  return fetchWithAuth(`/api/admin/deleted-messages/${logId}/restore`, {
    method: 'POST'
  });
};

// Banned IPs
export const getBannedIPs = async () => {
  return fetchWithAuth('/api/admin/banned-ips');
};

export const unbanIP = async (ip) => {
  return fetchWithAuth(`/api/admin/banned-ips/${encodeURIComponent(ip)}`, {
    method: 'DELETE'
  });
};

// Admin logs
export const getAdminLogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`/api/admin/logs${query ? `?${query}` : ''}`);
};