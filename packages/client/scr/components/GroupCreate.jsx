import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/chatStore';
import { useAuth } from '../hooks/useAuth';
import { searchUsers } from '../utils/api';

export default function GroupCreate() {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { createGroup } = useChatStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length >= 2) {
        setSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results.filter(u => u.id !== user?.id));
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    };
    
    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  const addMember = (member) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      toast.error('User already added');
      return;
    }
    setSelectedMembers([...selectedMembers, member]);
    setSearchQuery('');
  };

  const removeMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    
    if (groupName.length > 50) {
      toast.error('Group name must be less than 50 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const memberIds = selectedMembers.map(m => m.id);
      const group = await createGroup(groupName.trim(), description.trim(), memberIds);
      toast.success('Group created successfully');
      navigate(`/chat/${group.chatId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Create Group</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-text-secondary hover:text-text transition"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Info */}
          <div className="bg-surface rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Group Info</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition"
                  placeholder="Enter group name"
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition resize-none"
                  placeholder="What's this group about?"
                  maxLength={200}
                />
              </div>
            </div>
          </div>
          
          {/* Members */}
          <div className="bg-surface rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Members ({selectedMembers.length + 1})
            </h2>
            
            {/* Current members list */}
            <div className="mb-4">
              <div className="flex items-center gap-3 p-2 bg-surface-hover rounded-lg mb-2">
                <img
                  src={user?.avatarUrl || '/default-avatar.png'}
                  alt={user?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-text">@{user?.username}</p>
                  <p className="text-xs text-text-secondary">You (Owner)</p>
                </div>
              </div>
              
              {selectedMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-surface-hover rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatarUrl || '/default-avatar.png'}
                      alt={member.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-text">@{member.username}</p>
                      {member.bio && (
                        <p className="text-xs text-text-secondary truncate max-w-[200px]">{member.bio}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="text-error hover:text-error/80 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            {/* Search users */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users to add..."
                className="w-full px-4 py-2 pl-10 bg-surface-hover border border-border rounded-lg text-text placeholder-text-secondary focus:border-primary focus:outline-none transition"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="spinner w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg">
                {searchResults.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => addMember(user)}
                    className="w-full flex items-center justify-between p-2 hover:bg-surface-hover transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-text">@{user.username}</p>
                        {user.bio && (
                          <p className="text-xs text-text-secondary truncate max-w-[200px]">{user.bio}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-primary text-sm">Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !groupName.trim()}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? (
              <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto" />
            ) : (
              'Create Group'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}