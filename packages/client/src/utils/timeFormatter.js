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

export const formatFullTimestamp = (date) => {
  const d = new Date(date);
  return d.toLocaleString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatReadTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const readDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  if (readDay.getTime() === today.getTime()) {
    return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (readDay.getTime() === yesterday.getTime()) {
    return `Yesterday at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return d.toLocaleString([], {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
