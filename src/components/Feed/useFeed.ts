import { useState, useEffect, useRef, useCallback } from 'react';
import type { FeedItem, FeedResponse } from '../../types/feed';
import type { FeedType } from './FeedFilters';

interface UseFeedOptions {
  initialItems?: FeedItem[];
  initialCursor?: string | null;
}

export function useFeed({ initialItems = [], initialCursor = null }: UseFeedOptions = {}) {
  // Filter state
  const [activeTypes, setActiveTypes] = useState<FeedType[]>(['product', 'cause', 'cause_update']);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Feed state
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(initialItems.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Refs for intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch departments for filter
  useEffect(() => {
    fetch('/api/feed/departments')
      .then((res) => res.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);

  // Build query params
  const buildQueryParams = useCallback(
    (cursorValue?: string | null) => {
      const params = new URLSearchParams();
      if (cursorValue) params.append('cursor', cursorValue);
      params.append('limit', '20');
      if (activeTypes.length < 3) params.append('types', activeTypes.join(','));
      if (activeDepartment) params.append('department', activeDepartment);
      if (activeCategories.length > 0) params.append('categories', activeCategories.join(','));
      return params.toString();
    },
    [activeTypes, activeDepartment, activeCategories],
  );

  // Fetch feed items
  const fetchFeed = useCallback(
    async (cursorValue?: string | null, append = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const queryString = buildQueryParams(cursorValue);
        const response = await fetch(`/api/feed?${queryString}`);

        if (!response.ok) {
          throw new Error('Error al cargar el feed');
        }

        const data: FeedResponse = await response.json();

        if (append) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
        }

        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    },
    [buildQueryParams],
  );

  // Initial load
  useEffect(() => {
    if (initialItems.length === 0) {
      fetchFeed();
    }
  }, []);

  // Refetch when filters change
  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchFeed();
  }, [activeTypes, activeDepartment, activeCategories]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && cursor) {
          fetchFeed(cursor, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, cursor, fetchFeed]);

  // Clear all filters
  const handleClearFilters = () => {
    setActiveTypes(['product', 'cause', 'cause_update']);
    setActiveDepartment(null);
    setActiveCategories([]);
  };

  const hasActiveFilters =
    activeTypes.length < 3 || activeDepartment !== null || activeCategories.length > 0;

  return {
    // Feed data
    items,
    isLoading,
    isInitialLoading,
    error,
    hasMore,
    cursor,

    // Filter state
    activeTypes,
    activeDepartment,
    activeCategories,
    departments,
    hasActiveFilters,

    // Filter actions
    setActiveTypes,
    setActiveDepartment,
    setActiveCategories,
    handleClearFilters,

    // Feed actions
    fetchFeed,

    // Refs
    loadMoreRef,
  };
}
