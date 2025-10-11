/**
 * YouTube Data API v3 Integration
 * 
 * Provides secure access to YouTube search functionality for music track previews.
 * 
 * SECURITY NOTES:
 * - API key should be stored in environment variables
 * - In production, implement backend proxy to avoid exposing API key
 * - Rate limiting and error handling included
 * - Follows YouTube API best practices
 * 
 * API Documentation: https://developers.google.com/youtube/v3/docs/search/list
 */

import Constants from 'expo-constants';

// YouTube Data API v3 Configuration
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const MAX_RESULTS = 2; // Reduced for quota conservation
const VIDEO_DURATION = 'medium'; // 4-20 minutes (good for music)

// Rate limiting variables (ready for re-enabling)
// let lastRequestTime = 0;
// const MIN_REQUEST_INTERVAL = 2000; 
// let dailyRequestCount = 0;
// const MAX_DAILY_REQUESTS = 50;

/**
 * Get YouTube API key from secure environment variables
 * In production, this should be handled by a backend service
 */
const getApiKey = () => {
  // Try multiple environment variable sources
  const apiKey = 
    Constants.expoConfig?.extra?.YOUTUBE_API_KEY || 
    process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ||
    process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ YouTube API key not found in environment variables');
    return null;
  }

  return apiKey;
};

/**
 * Search YouTube for videos matching track information
 * @param {string} trackTitle - The track/song title
 * @param {string} artistName - The artist name
 * @param {string} albumTitle - The album/release title (optional)
 * @returns {Promise<Array>} Array of video results with embed URLs
 */
export const searchYouTubeVideos = async (trackTitle, artistName, albumTitle = '') => {
  try {
    // Rate limiting temporarily disabled (ready for re-enabling)
    // const now = Date.now();
    // const timeSinceLastRequest = now - lastRequestTime;
    // if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    //   const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    //   console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
    //   await new Promise(resolve => setTimeout(resolve, waitTime));
    // }
    // if (dailyRequestCount >= MAX_DAILY_REQUESTS) {
    //   console.log('🛑 Daily request limit reached, skipping search');
    //   return [];
    // }

    const apiKey = getApiKey();
    if (!apiKey) {
      console.log('🔑 YouTube API key not available, skipping video search');
      return [];
    }

    // Construct search query: "Artist Track Album" for better matching
    const searchQuery = [artistName, trackTitle, albumTitle]
      .filter(Boolean) // Remove empty values
      .join(' ')
      .trim();

    if (!searchQuery) {
      console.warn('⚠️ Empty search query, skipping YouTube search');
      return [];
    }

    console.log(`🔍 YouTube API search: "${searchQuery}"`);

    // Rate limiting counters temporarily disabled
    // lastRequestTime = now;
    // dailyRequestCount++;

    // YouTube Data API v3 search parameters
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      maxResults: MAX_RESULTS,
      videoDuration: VIDEO_DURATION,
      videoCategory: '10', // Music category
      key: apiKey,
      // Additional filters for music content
      safeSearch: 'moderate',
      relevanceLanguage: 'en',
    });

    const searchUrl = `${YOUTUBE_API_BASE_URL}/search?${searchParams}`;
    
    console.log('📡 Making YouTube API request...');
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://luckyfind.app', // Set your app domain
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ YouTube API error:', response.status, errorText);
      
      if (response.status === 403) {
        throw new Error('YouTube API key invalid or quota exceeded');
      } else if (response.status === 400) {
        throw new Error('Invalid YouTube API request parameters');
      } else {
        throw new Error(`YouTube API request failed: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log(`✅ YouTube API success: Found ${data.items?.length || 0} videos`);

    // Process and return video results
    return processYouTubeResults(data.items || [], searchQuery);

  } catch (error) {
    console.error('❌ YouTube search error:', error.message);
    
    // Provide user-friendly error information
    if (error.message.includes('quota exceeded')) {
      console.log('ℹ️ YouTube API quota exceeded. Videos will be available after quota reset (typically daily).');
    } else if (error.message.includes('invalid')) {
      console.log('ℹ️ YouTube API key issue. Please check your API key configuration.');
    }
    
    // Return empty array on error - graceful degradation
    return [];
  }
};

/**
 * Process YouTube API results into usable video objects
 * @param {Array} items - Raw YouTube API response items
 * @param {string} searchQuery - Original search query for logging
 * @returns {Array} Processed video objects
 */
const processYouTubeResults = (items, searchQuery) => {
  if (!items || items.length === 0) {
    console.log(`📺 No YouTube videos found for: "${searchQuery}"`);
    return [];
  }

  return items.map((item, index) => {
    const snippet = item.snippet;
    const videoId = item.id.videoId;

    // Create YouTube embed URL with privacy and autoplay settings
    const embedUrl = `https://www.youtube.com/embed/${videoId}?` + 
      'autoplay=0&' +           // No autoplay
      'rel=0&' +               // No related videos
      'modestbranding=1&' +    // Minimal YouTube branding
      'controls=1&' +          // Show controls
      'showinfo=0&' +          // Hide video info
      'fs=1&' +                // Allow fullscreen
      'playsinline=1&' +       // Inline playback on mobile
      'enablejsapi=1';         // Enable JavaScript API

    const processedVideo = {
      id: videoId,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      thumbnails: {
        default: snippet.thumbnails.default?.url,
        medium: snippet.thumbnails.medium?.url,
        high: snippet.thumbnails.high?.url,
      },
      embedUrl: embedUrl,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      relevanceScore: calculateRelevanceScore(snippet, searchQuery, index),
    };

    console.log(`🎬 Video ${index + 1}: ${processedVideo.title} (${processedVideo.channelTitle})`);
    return processedVideo;
  });
};

/**
 * Calculate relevance score for video results
 * Higher scores indicate better matches to the search query
 * @param {Object} snippet - YouTube video snippet
 * @param {string} searchQuery - Original search query
 * @param {number} index - Position in results (lower is better)
 * @returns {number} Relevance score (0-100)
 */
const calculateRelevanceScore = (snippet, searchQuery, index) => {
  let score = 100 - (index * 10); // Base score decreases with position

  const title = snippet.title.toLowerCase();
  const description = snippet.description.toLowerCase();
  const channel = snippet.channelTitle.toLowerCase();
  const query = searchQuery.toLowerCase();

  // Boost score for exact matches in title
  if (title.includes(query)) {
    score += 20;
  }

  // Boost for music-related channels
  const musicKeywords = ['official', 'music', 'records', 'vevo'];
  if (musicKeywords.some(keyword => channel.includes(keyword))) {
    score += 15;
  }

  // Boost for video descriptions mentioning music
  const musicDescKeywords = ['official video', 'music video', 'official audio'];
  if (musicDescKeywords.some(keyword => description.includes(keyword))) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Get video details for specific video IDs (if needed for additional info)
 * @param {Array<string>} videoIds - Array of YouTube video IDs
 * @returns {Promise<Array>} Array of detailed video information
 */
export const getVideoDetails = async (videoIds) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey || !videoIds.length) return [];

    const detailParams = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
      key: apiKey,
    });

    const detailUrl = `${YOUTUBE_API_BASE_URL}/videos?${detailParams}`;
    const response = await fetch(detailUrl);

    if (!response.ok) {
      throw new Error(`Video details request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];

  } catch (error) {
    console.error('❌ YouTube video details error:', error.message);
    return [];
  }
};

/**
 * Create a safe YouTube search URL (fallback for when API is unavailable)
 * @param {string} trackTitle - Track title
 * @param {string} artistName - Artist name
 * @param {string} albumTitle - Album title (optional)
 * @returns {string} YouTube search URL
 */
export const createYouTubeSearchUrl = (trackTitle, artistName, albumTitle = '') => {
  const searchQuery = [artistName, trackTitle, albumTitle]
    .filter(Boolean)
    .join(' ')
    .trim();

  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
};

/**
 * Check if YouTube API is available and configured
 * @returns {boolean} True if API is ready to use
 */
export const isYouTubeApiAvailable = () => {
  const apiKey = getApiKey();
  console.log('🔑 YouTube API Key check:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'Not found');
  console.log('🔑 Environment variables available:', {
    expoConfig: !!Constants.expoConfig?.extra?.YOUTUBE_API_KEY,
    processEnv: !!process.env.EXPO_PUBLIC_YOUTUBE_API_KEY
  });
  return !!apiKey;
};