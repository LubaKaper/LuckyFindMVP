/**
 * Data type definitions for LuckyFind MVP
 * Using JSDoc comments for type safety without TypeScript
 */

/**
 * @typedef {Object} Track
 * @property {string} title - Track title
 * @property {string} duration - Track duration (e.g., "3:45")
 * @property {number} [position] - Track position on release
 */

/**
 * @typedef {Object} Record
 * @property {string|number} id - Unique Discogs ID
 * @property {string} title - Full release title
 * @property {string} artist - Primary artist name
 * @property {number} year - Release year
 * @property {string[]} genres - Array of genre strings
 * @property {string[]} styles - Array of style strings
 * @property {string} label - Primary label name
 * @property {number} [labelReleaseCount] - Number of releases from this label
 * @property {string} country - Country of release
 * @property {number} [price] - Price (optional)
 * @property {string} imageUrl - Primary image URL
 * @property {string[]} formats - Array of format strings
 * @property {Track[]} [tracklist] - Array of track objects
 * @property {string} resourceUrl - Discogs API resource URL
 * @property {Object} [community] - Community stats
 * @property {number} [community.want] - Want count
 * @property {number} [community.have] - Have count
 */

/**
 * @typedef {Object} SearchState
 * @property {string} searchText - Main search query
 * @property {string[]} genreFilters - Selected genre filters
 * @property {string[]} styleFilters - Selected style filters
 * @property {number|null} priceMin - Minimum price filter
 * @property {number|null} priceMax - Maximum price filter
 * @property {number|null} yearFrom - Start year filter
 * @property {number|null} yearTo - End year filter
 * @property {string} artist - Artist filter (optional)
 * @property {string} label - Label filter
 * @property {string} country - Country filter
 * @property {number} [maxReleases] - Max label releases filter
 * @property {Object} pagination - Pagination state
 * @property {number} pagination.currentPage - Current page number
 * @property {number} pagination.itemsPerPage - Items per page
 */

/**
 * @typedef {Object} APIResponse
 * @property {Record[]} results - Array of record objects
 * @property {number} totalResults - Total number of results
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page
 * @property {number} pagination.pages - Total pages
 * @property {number} pagination.items - Total items
 * @property {number} pagination.per_page - Items per page
 */

// Export types for JSDoc usage
export const RecordTypes = {
  Track: 'Track',
  Record: 'Record',
  SearchState: 'SearchState',
  APIResponse: 'APIResponse',
};