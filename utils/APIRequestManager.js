/**
 * APIRequestManager
 * 
 * Manages API requests to prevent duplicates and handle caching.
 * Provides request deduplication, caching, and cleanup functionality.
 * 
 * Features:
 * - Request deduplication based on URL and parameters
 * - Memory-efficient LRU cache for responses
 * - Automatic cleanup of expired cache entries
 * - Request cancellation for component unmounting
 * - Debug logging for request patterns
 */

class APIRequestManager {
  constructor() {
    this.activeRequests = new Map(); // URL -> Promise
    this.cache = new Map(); // URL -> { data, timestamp, ttl }
    this.abortControllers = new Map(); // URL -> AbortController
    this.maxCacheSize = 50; // Maximum cached responses
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default cache TTL
  }

  /**
   * Generate a unique key for a request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {string} Unique request key
   */
  generateRequestKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}?${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if a request is currently active
   * @param {string} requestKey - Request key
   * @returns {boolean}
   */
  isRequestActive(requestKey) {
    return this.activeRequests.has(requestKey);
  }

  /**
   * Get cached response if valid
   * @param {string} requestKey - Request key
   * @returns {Object|null} Cached data or null
   */
  getCachedResponse(requestKey) {
    const cached = this.cache.get(requestKey);
    
    if (!cached) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(requestKey);
      console.log(`🗑️ Cache expired for ${requestKey}`);
      return null;
    }

    console.log(`💾 Cache hit for ${requestKey}`);
    return cached.data;
  }

  /**
   * Cache a response
   * @param {string} requestKey - Request key
   * @param {Object} data - Response data
   * @param {number} ttl - Time to live in milliseconds
   */
  cacheResponse(requestKey, data, ttl = this.defaultTTL) {
    // Implement simple LRU by removing oldest entry if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(`🧹 Cache evicted oldest entry: ${oldestKey}`);
    }

    this.cache.set(requestKey, {
      data: data,
      timestamp: Date.now(),
      ttl: ttl
    });

    console.log(`💾 Cached response for ${requestKey}`);
  }

  /**
   * Execute a request with deduplication and caching
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @param {Function} requestFunction - Function that executes the actual request
   * @param {Object} options - Additional options
   * @returns {Promise} Request promise
   */
  async executeRequest(endpoint, params, requestFunction, options = {}) {
    const requestKey = this.generateRequestKey(endpoint, params);
    const { 
      useCache = true, 
      cacheTTL = this.defaultTTL,
      forceRefresh = false 
    } = options;

    // Check cache first (if not forcing refresh)
    if (useCache && !forceRefresh) {
      const cachedResponse = this.getCachedResponse(requestKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // If request is already active, return the existing promise
    if (this.isRequestActive(requestKey)) {
      console.log(`🔄 Deduplicating request for ${requestKey}`);
      return this.activeRequests.get(requestKey);
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    this.abortControllers.set(requestKey, abortController);

    // Create and execute the request
    const requestPromise = this.executeWithCleanup(
      requestKey,
      requestFunction,
      abortController.signal,
      useCache,
      cacheTTL
    );

    // Store active request
    this.activeRequests.set(requestKey, requestPromise);
    console.log(`🚀 Starting request: ${requestKey}`);

    return requestPromise;
  }

  /**
   * Execute request with proper cleanup
   * @param {string} requestKey - Request key
   * @param {Function} requestFunction - Request function
   * @param {AbortSignal} signal - Abort signal
   * @param {boolean} useCache - Whether to cache the result
   * @param {number} cacheTTL - Cache TTL
   * @returns {Promise}
   */
  async executeWithCleanup(requestKey, requestFunction, signal, useCache, cacheTTL) {
    try {
      // Execute the actual request
      const result = await requestFunction(signal);

      // Cache the result if requested
      if (useCache) {
        this.cacheResponse(requestKey, result, cacheTTL);
      }

      console.log(`✅ Request completed: ${requestKey}`);
      return result;

    } catch (error) {
      // Don't log abort errors (they're expected)
      if (error.name !== 'AbortError') {
        console.error(`❌ Request failed: ${requestKey}`, error.message);
      }
      throw error;

    } finally {
      // Cleanup
      this.activeRequests.delete(requestKey);
      this.abortControllers.delete(requestKey);
    }
  }

  /**
   * Cancel a specific request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   */
  cancelRequest(endpoint, params) {
    const requestKey = this.generateRequestKey(endpoint, params);
    const abortController = this.abortControllers.get(requestKey);
    
    if (abortController) {
      abortController.abort();
      console.log(`🛑 Cancelled request: ${requestKey}`);
    }
  }

  /**
   * Cancel all active requests (useful for component unmounting)
   */
  cancelAllRequests() {
    for (const [requestKey, abortController] of this.abortControllers.entries()) {
      abortController.abort();
      console.log(`🛑 Cancelled request: ${requestKey}`);
    }
    
    this.activeRequests.clear();
    this.abortControllers.clear();
    console.log('🧹 All requests cancelled');
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      activeRequests: this.activeRequests.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }

    return cleanedCount;
  }

  /**
   * Create a request function that uses this manager
   * @param {string} endpoint - API endpoint
   * @param {Object} defaultOptions - Default options for requests to this endpoint
   * @returns {Function} Request function
   */
  createRequestFunction(endpoint, defaultOptions = {}) {
    return (params = {}, options = {}) => {
      const mergedOptions = { ...defaultOptions, ...options };
      
      return this.executeRequest(
        endpoint,
        params,
        (signal) => {
          // The actual request implementation should be provided by the caller
          throw new Error('Request function not implemented');
        },
        mergedOptions
      );
    };
  }
}

// Create a singleton instance
const apiRequestManager = new APIRequestManager();

// Periodic cleanup of expired cache entries
setInterval(() => {
  apiRequestManager.cleanupExpiredCache();
}, 60000); // Every minute

export default apiRequestManager;