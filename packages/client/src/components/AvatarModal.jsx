import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

// Set app element for accessibility
if (typeof window !== 'undefined') {
  ReactModal.setAppElement('#root');
}

export default function AvatarModal({ isOpen, onClose, src, alt }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/90 z-[1100] flex items-center justify-center"
      className="relative outline-none max-w-[90vw] max-h-[90vh]"
      closeTimeoutMS={200}
    >
      <div className="relative">
        <img
          src={src || '/default-avatar.png'}
          alt={alt || 'Avatar'}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
        
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-primary transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {alt && (
          <div className="absolute -bottom-8 left-0 right-0 text-center text-white text-sm">
            {alt}
          </div>
        )}
      </div>
    </ReactModal>
  );
}