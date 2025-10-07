/**
 * Discogs API integration module
 * Handles all API calls to the Discogs database for fetching vinyl records data.
 * 
 * API Documentation: https://www.discogs.com/developers/
 * Base URL: https://api.discogs.com/
 * 
 * Features:
 * - Public API access (no authentication required)
 * - OAuth 1.0a authentication (optional for enhanced features)
 * - Secure credential handling via environment variables
 * - Comprehensive search with multiple filters
 * - Rate limiting and error handling
 * - Mock data support for development
 */

import Constants from 'expo-constants';
import { isAuthenticated, makeAuthenticatedRequest } from './oauth';

// Discogs API configuration
const DISCOGS_BASE_URL = 'https://api.discogs.com';

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
 * Build year filter string for Discogs API
 * Discogs accepts year ranges in format "1990-1995" or single years "1990"
 * @param {string} yearFrom - Start year
 * @param {string} yearTo - End year
 * @returns {string} - Year filter string
 */
const buildYearFilter = (yearFrom, yearTo) => {
  if (yearFrom && yearTo) {
    return `${yearFrom}-${yearTo}`;
  } else if (yearFrom) {
    return yearFrom;
  } else if (yearTo) {
    return yearTo;
  }
  return '';
};

/**
 * Transform Discogs API search result to our app format
 * @param {Object} discogsResult - Raw result from Discogs API
 * @returns {Object} - Transformed result for our app
 */
const transformSearchResult = (discogsResult) => {
  return {
    id: discogsResult.id,
    type: discogsResult.type,
    title: discogsResult.title,
    artist: extractArtistFromTitle(discogsResult.title),
    album: extractAlbumFromTitle(discogsResult.title),
    year: discogsResult.year,
    thumb: discogsResult.thumb,
    cover_image: discogsResult.cover_image,
    resource_url: discogsResult.resource_url,
    uri: discogsResult.uri,
    
    // Format information
    format: discogsResult.format ? discogsResult.format.join(', ') : '',
    formats: discogsResult.format || [],
    
    // Label information
    label: discogsResult.label ? discogsResult.label.join(', ') : '',
    labels: discogsResult.label || [],
    
    // Genre and style information
    genre: discogsResult.genre ? discogsResult.genre.join(', ') : '',
    genres: discogsResult.genre || [],
    style: discogsResult.style ? discogsResult.style.join(', ') : '',
    styles: discogsResult.style || [],
    
    // Additional metadata
    country: discogsResult.country,
    catno: discogsResult.catno,
    barcode: discogsResult.barcode,
    
    // Community data
    community: discogsResult.community || { want: 0, have: 0 },
    
    // Master release info
    master_id: discogsResult.master_id,
    master_url: discogsResult.master_url,
  };
};

/**
 * Extract artist name from Discogs title (format: "Artist - Album")
 * @param {string} title - Full title from Discogs
 * @returns {string} - Artist name
 */
const extractArtistFromTitle = (title) => {
  if (!title) return '';
  const parts = title.split(' - ');
  return parts[0] || '';
};

/**
 * Extract album name from Discogs title (format: "Artist - Album")
 * @param {string} title - Full title from Discogs
 * @returns {string} - Album name
 */
const extractAlbumFromTitle = (title) => {
  if (!title) return '';
  const parts = title.split(' - ');
  return parts.slice(1).join(' - ') || title;
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
 * Search for records in the Discogs database without authentication
 * 
 * This function performs a public search request to the Discogs API
 * without requiring authentication. Perfect for basic searches.
 * 
 * @param {SearchParams} searchParams - Search parameters object
 * @param {string} [searchParams.query] - General search query
 * @param {string} [searchParams.genre] - Genre filter
 * @param {string} [searchParams.style] - Style/format filter
 * @param {string} [searchParams.artist] - Artist name filter
 * @param {string} [searchParams.label] - Record label filter
 * @param {string} [searchParams.yearFrom] - Start year for range
 * @param {string} [searchParams.yearTo] - End year for range
 * @param {number} [searchParams.page=1] - Page number for pagination
 * @param {number} [searchParams.per_page=50] - Results per page
 * @returns {Promise<SearchResponse>} - Search results with pagination
 */
export const searchRecordsPublic = async (searchParams) => {
  try {
    console.log('🔍 Searching Discogs (public API) with parameters:', searchParams);
    
    // Prepare search parameters for Discogs API
    const params = {
      // Main search query
      q: searchParams.query || searchParams.searchQuery,
      
      // Search type - focus on releases for vinyl records
      type: 'release',
      
      // Genre filter
      genre: searchParams.genre,
      
      // Style/format filter
      style: searchParams.style,
      format: searchParams.format || searchParams.style,
      
      // Artist filter
      artist: searchParams.artist,
      
      // Label filter
      label: searchParams.label,
      
      // Year filter
      year: buildYearFilter(searchParams.yearFrom, searchParams.yearTo),
      
      // Pagination
      page: searchParams.page || 1,
      per_page: Math.min(searchParams.per_page || 50, 100), // Max 100 per page
    };
    
    // Remove empty parameters
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    // Get authentication credentials from environment
    const personalToken = Constants.expoConfig?.extra?.DISCOGS_PERSONAL_TOKEN || 
                         process.env.EXPO_PUBLIC_DISCOGS_PERSONAL_TOKEN;
    const consumerKey = Constants.expoConfig?.extra?.DISCOGS_CONSUMER_KEY || 
                       process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_KEY;
    const consumerSecret = Constants.expoConfig?.extra?.DISCOGS_CONSUMER_SECRET || 
                          process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET;
    
    // Build query string
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${DISCOGS_BASE_URL}${ENDPOINTS.search}?${queryString}`;
    
    console.log('📡 Making API request to:', url);
    
    // Prepare headers
    const headers = {
      'User-Agent': 'LuckyFindMVP/1.0 +https://github.com/luba/LuckyFindMVP',
    };
    
    // Use Personal Access Token if available (preferred method)
    if (personalToken) {
      headers['Authorization'] = `Discogs token=${personalToken}`;
      console.log('🔑 Using Personal Access Token authentication');
    } else if (consumerKey && consumerSecret) {
      headers['Authorization'] = `Discogs key=${consumerKey}, secret=${consumerSecret}`;
      console.log('🔑 Using Key + Secret authentication');
    } else {
      console.warn('⚠️ No authentication credentials found, API may fail');
    }
    
    // Make API request
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    // Handle rate limiting
    if (response.status === 429) {
      console.warn('⚠️ Rate limit reached, please wait before making more requests');
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Public API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Public search successful, found', data.results?.length || 0, 'results');
    
    // Transform results to our format
    const transformedResults = data.results?.map(transformSearchResult) || [];
    
    return {
      results: transformedResults,
      pagination: data.pagination || {
        page: 1,
        pages: 1,
        per_page: 50,
        items: transformedResults.length,
        urls: {}
      }
    };
    
  } catch (error) {
    console.error('❌ Public search failed:', error.message);
    
    // Fallback to mock data if API authentication fails
    if (error.message.includes('401') || error.message.includes('authenticate')) {
      console.log('🔄 Falling back to mock data for development...');
      // Convert searchParams to filters format for mock function
      const filters = {
        searchQuery: searchParams.query || searchParams.searchQuery,
        genre: searchParams.genre,
        style: searchParams.style,
        artist: searchParams.artist,
        label: searchParams.label,
        yearFrom: searchParams.yearFrom,
        yearTo: searchParams.yearTo,
      };
      return await mockAdvancedSearch(filters);
    }
    
    throw error;
  }
};

/**
 * Search for records in the Discogs database using OAuth authentication
 * 
 * This function performs an authenticated search request to the Discogs API
 * using the stored OAuth tokens. It handles various search parameters including
 * text queries, genre filters, price ranges, and more.
 * 
 * @param {SearchParams} searchParams - Search parameters object
 * @param {string} [searchParams.query] - General search query
 * @param {string} [searchParams.genre] - Genre filter
 * @param {string} [searchParams.style] - Style/format filter
 * @param {string} [searchParams.artist] - Artist name filter
 * @param {string} [searchParams.label] - Record label filter
 * @param {string} [searchParams.yearFrom] - Start year for range
 * @param {string} [searchParams.yearTo] - End year for range
 * @param {string} [searchParams.priceMin] - Minimum price
 * @param {string} [searchParams.priceMax] - Maximum price
 * @param {number} [searchParams.page=1] - Page number for pagination
 * @param {number} [searchParams.per_page=50] - Results per page
 * @returns {Promise<SearchResponse>} - Search results with pagination
 * @throws {Error} - If authentication fails or API request fails
 */
export const searchRecords = async (searchParams) => {
  try {
    console.log('🔍 Searching Discogs with parameters:', searchParams);
    
    // Check authentication status
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      throw new Error('Authentication required. Please log in to Discogs first.');
    }
    
    // Prepare search parameters for Discogs API
    const params = {
      // Main search query
      q: searchParams.query || searchParams.searchQuery,
      
      // Search type - focus on releases for vinyl records
      type: 'release',
      
      // Genre filter
      genre: searchParams.genre,
      
      // Style/format filter
      style: searchParams.style,
      format: searchParams.format || searchParams.style,
      
      // Artist filter
      artist: searchParams.artist,
      
      // Label filter
      label: searchParams.label,
      
      // Year handling - Discogs supports year ranges
      year: buildYearFilter(searchParams.yearFrom, searchParams.yearTo),
      
      // Pagination
      page: searchParams.page || 1,
      per_page: Math.min(searchParams.per_page || 50, 100), // Discogs max is 100
    };
    
    // Remove empty parameters
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    });
    
    // Build full API URL
    const url = `${DISCOGS_BASE_URL}${ENDPOINTS.search}`;
    
    console.log('🔄 Making authenticated request to Discogs API...');
    
    // Make authenticated API request
    const response = await makeAuthenticatedRequest(url, 'GET', params);
    
    console.log(`✅ Search completed successfully. Found ${response.pagination?.items || 0} results`);
    
    // Transform response to match our expected format
    return {
      pagination: response.pagination || {
        page: 1,
        pages: 1,
        per_page: 50,
        items: 0,
        urls: {},
      },
      results: (response.results || []).map(transformSearchResult),
    };
    
  } catch (error) {
    console.error('❌ Search records failed:', error.message);
    
    // Re-throw with more specific error message
    if (error.message.includes('Authentication')) {
      throw new Error('Authentication failed. Please log in to your Discogs account.');
    } else if (error.message.includes('Rate limit')) {
      throw new Error('Too many requests. Please wait a moment before searching again.');
    } else {
      throw new Error(`Search failed: ${error.message}`);
    }
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
 * This is a convenience wrapper around searchRecords that accepts
 * the same filter format used by the SearchScreen component
 * 
 * @param {object} filters - Filter object containing search criteria
 * @param {string} [filters.searchQuery] - Main search query
 * @param {string} [filters.genre] - Genre filter
 * @param {string} [filters.style] - Style/format filter  
 * @param {string} [filters.artist] - Artist filter
 * @param {string} [filters.label] - Label filter
 * @param {string} [filters.yearFrom] - Start year for range
 * @param {string} [filters.yearTo] - End year for range
 * @param {string} [filters.priceMin] - Minimum price (note: Discogs doesn't support price filtering)
 * @param {string} [filters.priceMax] - Maximum price (note: Discogs doesn't support price filtering)
 * @param {number} [filters.page=1] - Page number
 * @param {number} [filters.perPage=50] - Results per page
 * @returns {Promise<SearchResponse>} - Filtered search results
 * @throws {Error} - If search fails or authentication is required
 */
export const advancedSearch = async (filters) => {
  try {
    console.log('🔍 Advanced search with filters:', filters);
    
    // Map filter object to search parameters
    const searchParams = {
      query: filters.searchQuery || filters.query,
      genre: filters.genre,
      style: filters.style,
      format: filters.format || filters.style,
      artist: filters.artist,
      label: filters.label,
      yearFrom: filters.yearFrom,
      yearTo: filters.yearTo,
      page: filters.page || 1,
      per_page: filters.perPage || filters.per_page || 50,
    };
    
    // Note: Discogs API doesn't support price filtering directly
    // Price information would need to be filtered from marketplace data
    if (filters.priceMin || filters.priceMax) {
      console.warn('⚠️ Price filtering is not supported by Discogs search API. Use marketplace API for pricing data.');
    }
    
    return await searchRecordsPublic(searchParams);
    
  } catch (error) {
    console.error('❌ Advanced search failed:', error.message);
    throw error; // Re-throw to preserve the original error message
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
      artist: 'The Beatles',
      album: 'Abbey Road',
      thumb: 'https://via.placeholder.com/150x150/D2B48C/000000?text=Abbey+Road',
      cover_image: 'https://via.placeholder.com/500x500/D2B48C/000000?text=Abbey+Road',
      resource_url: 'https://api.discogs.com/releases/1',
      year: '1969',
      format: 'Vinyl, LP, Album',
      formats: ['Vinyl', 'LP', 'Album'],
      label: 'Apple Records',
      labels: ['Apple Records'],
      genre: 'Rock',
      genres: ['Rock'],
      style: 'Pop Rock',
      styles: ['Pop Rock'],
      country: 'UK',
      community: { want: 1500, have: 3200 },
    },
    {
      id: 2,
      type: 'release',
      title: 'Pink Floyd - The Dark Side of the Moon',
      artist: 'Pink Floyd',
      album: 'The Dark Side of the Moon',
      thumb: 'https://via.placeholder.com/150x150/D2B48C/000000?text=Dark+Side',
      cover_image: 'https://via.placeholder.com/500x500/D2B48C/000000?text=Dark+Side',
      resource_url: 'https://api.discogs.com/releases/2',
      year: '1973',
      format: 'Vinyl, LP, Album',
      formats: ['Vinyl', 'LP', 'Album'],
      label: 'Harvest',
      labels: ['Harvest'],
      genre: 'Rock',
      genres: ['Rock'],
      style: 'Progressive Rock',
      styles: ['Progressive Rock'],
      country: 'UK',
      community: { want: 2100, have: 4800 },
    },
    {
      id: 3,
      type: 'release',
      title: 'Led Zeppelin - Led Zeppelin IV',
      artist: 'Led Zeppelin',
      album: 'Led Zeppelin IV',
      thumb: 'https://via.placeholder.com/150x150/D2B48C/000000?text=Led+Zep+IV',
      cover_image: 'https://via.placeholder.com/500x500/D2B48C/000000?text=Led+Zep+IV',
      resource_url: 'https://api.discogs.com/releases/3',
      year: '1971',
      format: 'Vinyl, LP, Album',
      formats: ['Vinyl', 'LP', 'Album'],
      label: 'Atlantic',
      labels: ['Atlantic'],
      genre: 'Rock',
      genres: ['Rock'],
      style: 'Hard Rock',
      styles: ['Hard Rock'],
      country: 'US',
      community: { want: 1800, have: 2900 },
    },
    {
      id: 4,
      type: 'release',
      title: 'Miles Davis - Kind of Blue',
      artist: 'Miles Davis',
      album: 'Kind of Blue',
      thumb: 'https://via.placeholder.com/150x150/D2B48C/000000?text=Kind+Blue',
      cover_image: 'https://via.placeholder.com/500x500/D2B48C/000000?text=Kind+Blue',
      resource_url: 'https://api.discogs.com/releases/4',
      year: '1959',
      format: 'Vinyl, LP, Album',
      formats: ['Vinyl', 'LP', 'Album'],
      label: 'Columbia',
      labels: ['Columbia'],
      genre: 'Jazz',
      genres: ['Jazz'],
      style: 'Cool Jazz',
      styles: ['Cool Jazz'],
      country: 'US',
      community: { want: 2500, have: 1800 },
    },
    {
      id: 5,
      type: 'release',
      title: 'Fleetwood Mac - Rumours',
      artist: 'Fleetwood Mac',
      album: 'Rumours',
      thumb: 'https://via.placeholder.com/150x150/D2B48C/000000?text=Rumours',
      cover_image: 'https://via.placeholder.com/500x500/D2B48C/000000?text=Rumours',
      resource_url: 'https://api.discogs.com/releases/5',
      year: '1977',
      format: 'Vinyl, LP, Album',
      formats: ['Vinyl', 'LP', 'Album'],
      label: 'Warner Bros.',
      labels: ['Warner Bros.'],
      genre: 'Rock',
      genres: ['Rock'],
      style: 'Pop Rock',
      styles: ['Pop Rock'],
      country: 'US',
      community: { want: 1200, have: 3800 },
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