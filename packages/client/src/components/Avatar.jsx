import React, { useState } from 'react';
import AvatarModal from './AvatarModal';

export default function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  onClick, 
  className = '',
  showModal = true 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
    '3xl': 'w-32 h-32'
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showModal && src && src !== '/default-avatar.png') {
      setModalOpen(true);
    }
  };
  
  return (
    <>
      <div
        className={`
          avatar relative rounded-full overflow-hidden bg-surface-hover
          ${sizeClasses[size]} ${className}
          ${(onClick || (showModal && src)) ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
        `}
        onClick={handleClick}
      >
        <img
          src={src || '/default-avatar.png'}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
      </div>
      
      {modalOpen && (
        <AvatarModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          src={src}
          alt={alt}
        />
      )}
    </>
  );
}