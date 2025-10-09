/**
 * Custom Hooks for Performance Optimization
 * 
 * Collection of reusable hooks for improving React Native app performance:
 * - useDebounce: Debounce rapid value changes
 * - useApiRequest: Manage API requests with cleanup and deduplication  
 * - useMemoizedCallback: Stable callback references
 * - useAsyncEffect: Handle async operations in useEffect
 * - useThrottledCallback: Throttle rapid function calls
 * - usePrevious: Track previous values for comparison
 * - useIsomorphicLayoutEffect: Cross-platform layout effect
 * - useUpdateEffect: Effect that skips initial render
 * - useMountedRef: Track component mount status
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { APIRequestManager } from '../utils/APIRequestManager';

// ==========================================
// DEBOUNCING HOOKS
// ==========================================

/**
 * useDebounce Hook
 * Delays updating a value until after a specified delay period
 * Prevents excessive API calls or expensive computations
 * 
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useThrottledCallback Hook
 * Throttles a callback to execute at most once per specified interval
 * Useful for scroll handlers, resize events, etc.
 * 
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Minimum delay between calls in milliseconds
 * @returns {Function} - Throttled callback function
 */
export const useThrottledCallback = (callback, delay) => {
  const throttling = useRef(false);
  const lastArgs = useRef();

  return useCallback((...args) => {
    lastArgs.current = args;

    if (!throttling.current) {
      throttling.current = true;
      callback(...args);

      setTimeout(() => {
        throttling.current = false;
        // Execute with latest args if they changed during throttling
        if (lastArgs.current !== args) {
          callback(...lastArgs.current);
        }
      }, delay);
    }
  }, [callback, delay]);
};

// ==========================================
// API REQUEST MANAGEMENT
// ==========================================

/**
 * useApiRequest Hook  
 * Provides optimized API request functionality with cleanup
 * Integrates with APIRequestManager for deduplication and caching
 * 
 * @returns {object} - Object with executeRequest and cancelRequest functions
 */
export const useApiRequest = () => {
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  const executeRequest = useCallback(async (requestFunction, cacheKey = null) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      let result;

      if (cacheKey) {
        // Use APIRequestManager for caching and deduplication
        result = await APIRequestManager.executeRequest(
          cacheKey,
          requestFunction,
          abortControllerRef.current.signal
        );
      } else {
        // Execute request directly
        result = await requestFunction(abortControllerRef.current.signal);
      }

      if (!mountedRef.current) {
        console.warn('⚠️ Component unmounted before request completed');
        return null;
      }

      return result;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Request was cancelled');
        return null;
      }

      if (!mountedRef.current) {
        console.warn('⚠️ Component unmounted during request error');
        return null;
      }

      throw error;
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cancelRequest();
    };
  }, [cancelRequest]);

  return { executeRequest, cancelRequest };
};

// ==========================================
// CALLBACK OPTIMIZATION
// ==========================================

/**
 * useMemoizedCallback Hook
 * Creates a stable callback reference that only changes when dependencies change
 * More explicit than useCallback for complex dependency arrays
 * 
 * @param {Function} callback - Function to memoize
 * @param {Array} dependencies - Dependency array
 * @returns {Function} - Memoized callback
 */
export const useMemoizedCallback = (callback, dependencies) => {
  const ref = useRef();

  // Update callback when dependencies change
  useLayoutEffect(() => {
    ref.current = callback;
  });

  // Return stable callback that calls the latest version
  return useCallback((...args) => {
    return ref.current?.(...args);
  }, dependencies);
};

// ==========================================
// ASYNC EFFECT MANAGEMENT
// ==========================================

/**
 * useAsyncEffect Hook
 * Handles async operations in useEffect with proper cleanup
 * Prevents memory leaks from async operations
 * 
 * @param {Function} asyncFunction - Async function to execute
 * @param {Array} dependencies - Dependency array
 * @param {Function} cleanup - Optional cleanup function
 */
export const useAsyncEffect = (asyncFunction, dependencies, cleanup) => {
  const mountedRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    const executeAsync = async () => {
      try {
        if (!cancelled && mountedRef.current) {
          await asyncFunction();
        }
      } catch (error) {
        if (!cancelled && mountedRef.current) {
          console.error('Async effect error:', error);
        }
      }
    };

    executeAsync();

    return () => {
      cancelled = true;
      if (cleanup) {
        cleanup();
      }
    };
  }, dependencies);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
};

// ==========================================
// VALUE TRACKING
// ==========================================

/**
 * usePrevious Hook
 * Tracks the previous value of a variable
 * Useful for comparing current and previous values
 * 
 * @param {any} value - Value to track
 * @returns {any} - Previous value
 */
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

/**
 * useUpdateEffect Hook
 * useEffect that skips the initial render
 * Only runs on updates, not on mount
 * 
 * @param {Function} effect - Effect function
 * @param {Array} dependencies - Dependency array
 */
export const useUpdateEffect = (effect, dependencies) => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, dependencies);
};

// ==========================================
// COMPONENT LIFECYCLE
// ==========================================

/**
 * useMountedRef Hook
 * Provides a ref that tracks if the component is still mounted
 * Prevents state updates on unmounted components
 * 
 * @returns {React.MutableRefObject<boolean>} - Mounted status ref
 */
export const useMountedRef = () => {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
};

/**
 * useIsomorphicLayoutEffect Hook
 * Cross-platform useLayoutEffect that falls back to useEffect on React Native
 * Ensures compatibility across different platforms
 * 
 * @param {Function} effect - Effect function
 * @param {Array} dependencies - Dependency array
 */
export const useIsomorphicLayoutEffect = Platform.select({
  web: useLayoutEffect,
  default: useEffect,
});

// ==========================================
// SPECIALIZED PERFORMANCE HOOKS
// ==========================================

/**
 * useScrollOptimization Hook
 * Optimizes scroll event handling with throttling and momentum detection
 * 
 * @param {Function} onScroll - Scroll handler function
 * @param {number} throttleDelay - Throttle delay in milliseconds
 * @returns {Function} - Optimized scroll handler
 */
export const useScrollOptimization = (onScroll, throttleDelay = 16) => {
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  const throttledScrollHandler = useThrottledCallback(onScroll, throttleDelay);

  return useCallback((event) => {
    // Track scrolling state
    if (!isScrolling.current) {
      isScrolling.current = true;
    }

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Execute throttled handler
    throttledScrollHandler(event);

    // Set timeout to detect scroll end
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
    }, 150);

  }, [throttledScrollHandler]);
};

/**
 * useFocusOptimization Hook
 * Optimizes focus/blur handling for form inputs
 * Prevents unnecessary re-renders during focus changes
 * 
 * @param {Function} onFocus - Focus handler
 * @param {Function} onBlur - Blur handler  
 * @returns {object} - Optimized focus handlers
 */
export const useFocusOptimization = (onFocus, onBlur) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((event) => {
    if (!isFocused) {
      setIsFocused(true);
      onFocus?.(event);
    }
  }, [isFocused, onFocus]);

  const handleBlur = useCallback((event) => {
    if (isFocused) {
      setIsFocused(false);
      onBlur?.(event);
    }
  }, [isFocused, onBlur]);

  return {
    isFocused,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
};

/**
 * useKeyboardOptimization Hook  
 * Optimizes keyboard event handling with proper cleanup
 * 
 * @param {Function} onShow - Keyboard show handler
 * @param {Function} onHide - Keyboard hide handler
 * @returns {boolean} - Keyboard visibility status
 */
export const useKeyboardOptimization = (onShow, onHide) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setIsKeyboardVisible(true);
      onShow?.(event);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', (event) => {
      setIsKeyboardVisible(false);
      onHide?.(event);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [onShow, onHide]);

  return isKeyboardVisible;
};

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

/**
 * usePerformanceMonitor Hook
 * Monitors component render performance and logs warnings for slow renders
 * 
 * @param {string} componentName - Name of the component for logging
 * @param {number} threshold - Render time threshold in milliseconds
 */
export const usePerformanceMonitor = (componentName, threshold = 16) => {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (renderTime > threshold) {
      console.warn(
        `⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }

    // Reset for next render
    renderStartTime.current = performance.now();
  });
};

/**
 * useMemoryOptimization Hook
 * Provides utilities for memory-conscious programming
 * 
 * @returns {object} - Memory optimization utilities
 */
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup function error:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    addCleanup,
    cleanup,
    isMemoryConstrained: Platform.OS === 'android', // Simple heuristic
  };
};