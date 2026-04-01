import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { uploadAvatar } from '../utils/upload';

export default function ProfileEditor() {
  const { user, updateProfile, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        phone: user.phone || '',
        email: user.email || ''
      });
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    
    if (formData.username.length < 2) {
      toast.error('Username must be at least 2 characters');
      return;
    }
    
    if (formData.username.length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain letters, numbers and underscore');
      return;
    }
    
    setLoading(true);
    
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setUploadingAvatar(true);
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    try {
      const result = await uploadAvatar(file);
      if (result) {
        await updateAvatar(result.avatarUrl);
        toast.success('Avatar updated');
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      setAvatarPreview(user?.avatarUrl);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Remove your avatar?')) return;
    
    setUploadingAvatar(true);
    try {
      await updateAvatar(null);
      setAvatarPreview(null);
      toast.success('Avatar removed');
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Edit Profile</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-text-secondary hover:text-text transition"
          >
            Cancel
          </button>
        </div>
        
        {/* Avatar Section */}
        <div className="bg-surface rounded-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={avatarPreview || '/default-avatar.png'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="spinner w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
                disabled={uploadingAvatar}
              >
                Upload Photo
              </button>
              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  className="px-4 py-2 bg-surface-hover hover:bg-error hover:text-white text-text rounded-lg transition"
                  disabled={uploadingAvatar}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-text-secondary mt-3">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
        
        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition"
              placeholder="cool_username"
            />
            <p className="text-xs text-text-secondary mt-1">
              Letters, numbers, and underscore only. 2-20 characters.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition resize-none"
              placeholder="Tell something about yourself..."
              maxLength="200"
            />
            <p className="text-xs text-text-secondary mt-1">
              {formData.bio.length}/200 characters
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition"
              placeholder="+1 234 567 8900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}