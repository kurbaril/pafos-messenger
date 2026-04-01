import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchMore, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
    initialLoad = true
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const lastElementRef = useRef(null);
  const isFetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore || !enabled) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchMore();
      setHasMore(result.hasMore !== false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchMore, hasMore, enabled]);

  useEffect(() => {
    if (initialLoad && enabled && hasMore && !isFetchingRef.current) {
      loadMore();
    }
  }, [initialLoad, enabled, hasMore, loadMore]);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [target] = entries;
        if (target.isIntersecting && hasMore && !isFetchingRef.current && !isLoading) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, loadMore, threshold, rootMargin]);

  const setLastElement = useCallback((node) => {
    if (lastElementRef.current && observerRef.current) {
      observerRef.current.unobserve(lastElementRef.current);
    }
    
    lastElementRef.current = node;
    
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  const reset = useCallback(() => {
    setHasMore(true);
    setIsLoading(false);
    setError(null);
    isFetchingRef.current = false;
  }, []);

  return {
    isLoading,
    hasMore,
    error,
    setLastElement,
    loadMore,
    reset
  };
};