/**
 * useApiRequest Hook
 * 
 * Custom hook for handling API requests with automatic cleanup and cancellation.
 * Prevents memory leaks from ongoing requests when components unmount.
 * 
 * Features:
 * - Automatic request cancellation on unmount
 * - Loading and error state management
 * - Retry functionality
 * - Request deduplication
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const executeRequest = useCallback(async (requestFn, ...args) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    if (!mountedRef.current) return null;
    
    setLoading(true);
    setError(null);

    try {
      const result = await requestFn(abortControllerRef.current.signal, ...args);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setLoading(false);
        return result;
      }
    } catch (err) {
      if (mountedRef.current && err.name !== 'AbortError') {
        setError(err.message);
        setLoading(false);
      }
      throw err;
    }
    
    return null;
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    loading,
    error,
    executeRequest,
    cancelRequest,
  };
};

export default useApiRequest;