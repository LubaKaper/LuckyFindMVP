/**
 * Discogs API integration module
 * Handles all API calls to the Discogs database for fetching vinyl records data.
 * 
 * API Documentation: https://www.discogs.com/developers/
 * Base URL: https://api.discogs.com/
 * 
 * Note: For production use, you'll need to register for a Discogs API token
 * and implement proper authentication.
 */

// Discogs API configuration
const DISCOGS_BASE_URL = 'https://api.discogs.com';
const API_VERSION = 'v1'; // Current API version

// API endpoints
const ENDPOINTS = {
  search: '/database/search',
  release: '/releases',
  artist: '/artists',
  label: '/labels',
  master: '/masters',
};

/**
 * Search parameters object structure for documentation
 * @typedef {Object} SearchParams
 * @property {string} [query] - General search query
 * @property {string} [type] - Search type: 'release', 'master', 'artist', 'label'
 * @property {string} [title] - Title search
 * @property {string} [release_title] - Release title search
 * @property {string} [credit] - Credit search
 * @property {string} [artist] - Artist name search
 * @property {string} [anv] - Artist name variation search
 * @property {string} [label] - Label search
 * @property {string} [genre] - Genre filter
 * @property {string} [style] - Style filter
 * @property {string} [country] - Country filter
 * @property {string} [year] - Year or year range filter
 * @property {string} [format] - Format filter
 * @property {string} [catno] - Catalog number search
 * @property {string} [barcode] - Barcode search
 * @property {string} [track] - Track search
 * @property {string} [submitter] - Submitter search
 * @property {string} [contributor] - Contributor search
 * @property {number} [page] - Page number for pagination
 * @property {number} [per_page] - Results per page
 */

/**
 * Response object structure for search results
 * @typedef {Object} SearchResponse
 * @property {Object} pagination - Pagination information
 * @property {number} pagination.page - Current page number
 * @property {number} pagination.pages - Total pages
 * @property {number} pagination.per_page - Results per page
 * @property {number} pagination.items - Total items
 * @property {Object} pagination.urls - Pagination URLs
 * @property {string} [pagination.urls.last] - Last page URL
 * @property {string} [pagination.urls.next] - Next page URL
 * @property {SearchResult[]} results - Array of search results
 */

/**
 * Individual search result object structure
 * @typedef {Object} SearchResult
 * @property {number} id - Discogs ID
 * @property {string} type - Result type
 * @property {*} [user_data] - User-specific data
 * @property {number} [master_id] - Master release ID
 * @property {string} [master_url] - Master release URL
 * @property {string} uri - Resource URI
 * @property {string} title - Release title
 * @property {string} thumb - Thumbnail image URL
 * @property {string} cover_image - Cover image URL
 * @property {string} resource_url - Full resource URL
 * @property {string} [country] - Country of release
 * @property {string} [year] - Release year
 * @property {string[]} [format] - Format array
 * @property {string[]} [label] - Label array
 * @property {string[]} [genre] - Genre array
 * @property {string[]} [style] - Style array
 * @property {string[]} [barcode] - Barcode array
 * @property {string} [catno] - Catalog number
 * @property {Object} [community] - Community stats
 * @property {number} [community.want] - Want count
 * @property {number} [community.have] - Have count
 */

/**
 * Creates the full API URL with parameters
 * @param {string} endpoint - API endpoint
 * @param {SearchParams} params - Search parameters
 * @returns {string} - Complete API URL
 */
const buildApiUrl = (endpoint, params = {}) => {
  const baseUrl = `${DISCOGS_BASE_URL}${endpoint}`;
  const searchParams = new URLSearchParams();
  
  // Add parameters to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
};

/**
 * Generic API request function with error handling
 * @param {string} url - API URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - API response data
 */
const apiRequest = async (url, options = {}) => {
  try {
    console.log('🔄 Making API request to:', url);
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'LuckyFindMVP/1.0.0 +https://yourapp.com', // Required by Discogs API
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Add Authorization header when you have a token
        // 'Authorization': `Discogs token=${YOUR_DISCOGS_TOKEN}`,
      },
      ...options,
    };
    
    const response = await fetch(url, defaultOptions);
    
    // Check for rate limiting
    if (response.status === 429) {
      console.warn('⚠️ Rate limit reached, please wait before making more requests');
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    // Check for other errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ API request successful');
    return data;
    
  } catch (error) {
    console.error('❌ API Request failed:', error.message);
    throw error;
  }
};

/**
 * Search for records in the Discogs database
 * @param {SearchParams} searchParams - Search parameters
 * @returns {Promise<SearchResponse>} - Search results
 */
export const searchRecords = async (searchParams) => {
  try {
    // Prepare search parameters
    const params = {
      ...searchParams,
      per_page: searchParams.per_page || 50, // Default to 50 results per page
      page: searchParams.page || 1, // Default to first page
    };
    
    // Build API URL
    const url = buildApiUrl(ENDPOINTS.search, params);
    
    // Make API request
    const response = await apiRequest(url);
    
    return response;
    
  } catch (error) {
    console.error('❌ Search records failed:', error.message);
    throw new Error(`Failed to search records: ${error.message}`);
  }
};

/**
 * Get detailed information about a specific release
 * @param {number} releaseId - Discogs release ID
 * @returns {Promise<any>} - Detailed release information
 */
export const getReleaseDetails = async (releaseId) => {
  try {
    const url = `${DISCOGS_BASE_URL}${ENDPOINTS.release}/${releaseId}`;
    const response = await apiRequest(url);
    return response;
  } catch (error) {
    console.error('❌ Get release details failed:', error.message);
    throw new Error(`Failed to get release details: ${error.message}`);
  }
};

/**
 * Get artist information
 * @param {number} artistId - Discogs artist ID
 * @returns {Promise<any>} - Artist information
 */
export const getArtistInfo = async (artistId) => {
  try {
    const url = `${DISCOGS_BASE_URL}${ENDPOINTS.artist}/${artistId}`;
    const response = await apiRequest(url);
    return response;
  } catch (error) {
    console.error('❌ Get artist info failed:', error.message);
    throw new Error(`Failed to get artist info: ${error.message}`);
  }
};

/**
 * Get label information
 * @param {number} labelId - Discogs label ID
 * @returns {Promise<any>} - Label information
 */
export const getLabelInfo = async (labelId) => {
  try {
    const url = `${DISCOGS_BASE_URL}${ENDPOINTS.label}/${labelId}`;
    const response = await apiRequest(url);
    return response;
  } catch (error) {
    console.error('❌ Get label info failed:', error.message);
    throw new Error(`Failed to get label info: ${error.message}`);
  }
};

/**
 * Advanced search with multiple filters
 * This function combines multiple search parameters for more specific results
 * @param {object} filters - Filter object containing search criteria
 * @returns {Promise<SearchResponse>} - Filtered search results
 */
export const advancedSearch = async (filters) => {
  try {
    const {
      searchQuery,
      genre,
      style,
      artist,
      label,
      yearFrom,
      yearTo,
      format,
      country,
      page = 1,
      perPage = 50,
    } = filters;
    
    // Build search parameters
    const searchParams = {
      q: searchQuery,
      type: 'release', // Focus on releases for record search
      genre: genre,
      style: style,
      artist: artist,
      label: label,
      format: format,
      country: country,
      page: page,
      per_page: perPage,
    };
    
    // Handle year range
    if (yearFrom && yearTo) {
      searchParams.year = `${yearFrom}-${yearTo}`;
    } else if (yearFrom) {
      searchParams.year = yearFrom;
    } else if (yearTo) {
      searchParams.year = yearTo;
    }
    
    console.log('🔍 Advanced search with filters:', searchParams);
    
    return await searchRecords(searchParams);
    
  } catch (error) {
    console.error('❌ Advanced search failed:', error.message);
    throw new Error(`Advanced search failed: ${error.message}`);
  }
};

/**
 * Get suggestions for search autocomplete
 * @param {string} query - Partial search query
 * @param {string} type - Type of suggestion (artist, label, etc.)
 * @returns {Promise<any[]>} - Array of suggestions
 */
export const getSuggestions = async (query, type = 'artist') => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    const searchParams = {
      q: query,
      type: type,
      per_page: 10, // Limit suggestions
    };
    
    const response = await searchRecords(searchParams);
    return response.results || [];
    
  } catch (error) {
    console.error('❌ Get suggestions failed:', error.message);
    return []; // Return empty array on error to prevent UI crashes
  }
};

/**
 * Mock data for development and testing
 * Remove this in production when real API is integrated
 */
export const mockSearchResults = {
  pagination: {
    page: 1,
    pages: 10,
    per_page: 50,
    items: 500,
    urls: {},
  },
  results: [
    {
      id: 1,
      type: 'release',
      title: 'The Beatles - Abbey Road',
      thumb: 'https://via.placeholder.com/150x150/D2B48C/000000?text=Abbey+Road',
      cover_image: 'https://via.placeholder.com/500x500/D2B48C/000000?text=Abbey+Road',
      resource_url: 'https://api.discogs.com/releases/1',
      year: '1969',
      format: ['Vinyl', 'LP', 'Album'],
      label: ['Apple Records'],
      genre: ['Rock'],
      style: ['Pop Rock'],
      country: 'UK',
      community: { want: 1500, have: 3200 },
    },
    {
      id: 2,
      type: 'release',
      title: 'Pink Floyd - The Dark Side of the Moon',
      thumb: 'https://via.placeholder.com/150x150/D2B48C/000000?text=Dark+Side',
      cover_image: 'https://via.placeholder.com/500x500/D2B48C/000000?text=Dark+Side',
      resource_url: 'https://api.discogs.com/releases/2',
      year: '1973',
      format: ['Vinyl', 'LP', 'Album'],
      label: ['Harvest'],
      genre: ['Rock'],
      style: ['Progressive Rock'],
      country: 'UK',
      community: { want: 2100, have: 4800 },
    },
  ],
};

/**
 * Development/testing function that returns mock data
 * @param {object} filters - Search filters (unused in mock)
 * @returns {Promise<object>} - Mock search results
 */
export const mockAdvancedSearch = async (filters) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('🔄 Mock search with filters:', filters);
  return mockSearchResults;
};

// Export all functions for use in components
export default {
  searchRecords,
  getReleaseDetails,
  getArtistInfo,
  getLabelInfo,
  advancedSearch,
  getSuggestions,
  mockAdvancedSearch,
  mockSearchResults,
};