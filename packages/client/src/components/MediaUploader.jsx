import React, { useRef, useState } from 'react';
import { uploadImage, uploadFile } from '../api';
import toast from 'react-hot-toast';

export default function MediaUploader({ onUpload, disabled }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Max 20MB');
      return;
    }

    setUploading(true);
    
    try {
      let result;
      if (type === 'image') {
        // Validate image type
        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }
        result = await uploadImage(file);
      } else {
        result = await uploadFile(file);
      }
      
      onUpload(result);
      toast.success('File uploaded');
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      // Clear input
      if (type === 'image' && imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      if (type === 'file' && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Image Upload */}
      <button
        onClick={() => imageInputRef.current?.click()}
        disabled={disabled || uploading}
        className="p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-all disabled:opacity-50"
        title="Upload image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
          disabled={disabled || uploading}
        />
      </button>

      {/* File Upload */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-all disabled:opacity-50"
        title="Upload file"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e, 'file')}
          className="hidden"
          disabled={disabled || uploading}
        />
      </button>

      {/* Uploading indicator */}
      {uploading && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-surface border border-border rounded-lg text-xs text-text-secondary flex items-center gap-2 whitespace-nowrap">
          <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
}