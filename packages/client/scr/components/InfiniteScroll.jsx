import React, { useEffect, useRef, useCallback } from 'react';

export default function InfiniteScroll({ 
  children, 
  hasMore, 
  isLoading, 
  onLoadMore,
  loader,
  endMessage
}) {
  const observerRef = useRef();
  const lastElementRef = useRef();

  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });
    
    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }
    
    return () => {
      if (lastElementRef.current) {
        observer.unobserve(lastElementRef.current);
      }
    };
  }, [handleObserver]);

  return (
    <div className="infinite-scroll-container">
      {children}
      
      <div ref={lastElementRef} className="infinite-scroll-trigger" />
      
      {isLoading && (
        <div className="flex justify-center py-4">
          {loader || (
            <div className="flex items-center gap-2 text-text-secondary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && !isLoading && endMessage && (
        <div className="text-center py-4 text-text-secondary text-sm">
          {endMessage}
        </div>
      )}
    </div>
  );
}