/**
 * Format message time for display
 */
export const formatMessageTime = (date) => {
  if (!date) return 'Never';
  
  const now = new Date();
  const msgDate = new Date(date);
  const diff = now - msgDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return msgDate.toLocaleDateString([], { weekday: 'short' });
  } else {
    return msgDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration for voice messages
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get color based on activity level
 */
export const getActivityColor = (value, max) => {
  const ratio = value / max;
  if (ratio > 0.7) return '#EF4444';
  if (ratio > 0.4) return '#F59E0B';
  if (ratio > 0.2) return '#7C3AED';
  return '#3B82F6';
};

/**
 * Generate random color for charts
 */
export const getRandomColor = (index) => {
  const colors = [
    '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6',
    '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#6366F1'
  ];
  return colors[index % colors.length];
};

/**
 * Aggregate data by hour
 */
export const aggregateByHour = (messages) => {
  const hourly = Array(24).fill(0);
  
  messages.forEach(msg => {
    const hour = new Date(msg.createdAt).getHours();
    hourly[hour]++;
  });
  
  return hourly.map((count, hour) => ({ hour, count }));
};

/**
 * Aggregate data by day of week
 */
export const aggregateByDay = (messages) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daily = Array(7).fill(0);
  
  messages.forEach(msg => {
    const day = new Date(msg.createdAt).getDay();
    daily[day]++;
  });
  
  return daily.map((count, index) => ({ day: days[index], count }));
};

/**
 * Prepare data for heatmap
 */
export const prepareHeatmapData = (messages) => {
  const heatmap = Array(7).fill().map(() => Array(24).fill(0));
  
  messages.forEach(msg => {
    const date = new Date(msg.createdAt);
    const day = date.getDay();
    const hour = date.getHours();
    heatmap[day][hour]++;
  });
  
  return heatmap;
};

/**
 * Calculate trend (percentage change)
 */
export const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format number with K/M suffix
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};