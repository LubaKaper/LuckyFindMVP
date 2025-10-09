/**
 * useRateLimitHandler Hook
 * 
 * Provides user-friendly handling of API rate limit errors
 * with automatic retry logic and user feedback
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

const useRateLimitHandler = () => {
  const [isWaitingForRateLimit, setIsWaitingForRateLimit] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  /**
   * Handle rate limit errors with user feedback
   */
  const handleRateLimitError = useCallback((error, retryFunction) => {
    if (error.message.includes('Rate limit') || error.message.includes('429')) {
      setIsWaitingForRateLimit(true);
      setRateLimitMessage('API rate limit reached. Please wait a moment...');
      
      // Show user-friendly alert
      Alert.alert(
        'Rate Limit Reached',
        'The Discogs API is temporarily limiting requests. The app will automatically retry in a few seconds.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear the message after user acknowledges
              setTimeout(() => {
                setIsWaitingForRateLimit(false);
                setRateLimitMessage('');
              }, 3000);
            }
          }
        ]
      );
      
      return true; // Indicates this was a rate limit error
    }
    
    return false; // Not a rate limit error
  }, []);

  /**
   * Execute a function with rate limit handling
   */
  const executeWithRateLimitHandling = useCallback(async (asyncFunction, showUserFeedback = true) => {
    try {
      setIsWaitingForRateLimit(false);
      setRateLimitMessage('');
      
      const result = await asyncFunction();
      return result;
      
    } catch (error) {
      if (showUserFeedback && handleRateLimitError(error, asyncFunction)) {
        // Rate limit error handled, rethrow for component to handle
        throw new Error('Rate limit - please wait');
      } else {
        // Other error, rethrow as-is
        throw error;
      }
    }
  }, [handleRateLimitError]);

  /**
   * Get user-friendly error message for display
   */
  const getDisplayError = useCallback((error) => {
    if (error.message.includes('Rate limit') || error.message.includes('429')) {
      return 'API rate limit reached. Please try again in a moment.';
    }
    
    if (error.message.includes('Network')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    if (error.message.includes('401') || error.message.includes('authenticate')) {
      return 'Authentication issue. Please check your API credentials.';
    }
    
    // Generic error message
    return 'Unable to load data. Please try again later.';
  }, []);

  return {
    isWaitingForRateLimit,
    rateLimitMessage,
    handleRateLimitError,
    executeWithRateLimitHandling,
    getDisplayError,
  };
};

export default useRateLimitHandler;