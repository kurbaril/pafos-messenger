import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useBlocks } from '../hooks/useBlocks';
import Avatar from './Avatar';

export default function UserBlock({ userId, username, avatarUrl, onBlocked }) {
  const { isBlocked, blockUser, unblockUser, loading } = useBlocks();
  const [blocked, setBlocked] = useState(false);

  const checkIfBlocked = async () => {
    const result = await isBlocked(userId);
    setBlocked(result);
  };

  React.useEffect(() => {
    checkIfBlocked();
  }, [userId]);

  const handleBlock = async () => {
    try {
      await blockUser(userId);
      setBlocked(true);
      toast.success(`Blocked @${username}`);
      if (onBlocked) onBlocked(userId);
    } catch (error) {
      toast.error(error.message || 'Failed to block user');
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUser(userId);
      setBlocked(false);
      toast.success(`Unblocked @${username}`);
    } catch (error) {
      toast.error(error.message || 'Failed to unblock user');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar src={avatarUrl} alt={username} size="md" />
        <div>
          <div className="font-medium text-text">@{username}</div>
          <div className="text-xs text-text-secondary">
            {blocked ? 'Blocked' : 'Can message you'}
          </div>
        </div>
      </div>
      
      <button
        onClick={blocked ? handleUnblock : handleBlock}
        disabled={loading}
        className={`
          px-3 py-1 rounded-lg text-sm font-medium transition-all
          ${blocked 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : blocked ? 'Unblock' : 'Block'}
      </button>
    </div>
  );
}