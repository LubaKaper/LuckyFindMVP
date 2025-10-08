/**
 * Quick Test for Search Issues
 * 
 * This script will help debug the search functionality issues
 */

// Test search parameters that should work
const testStyleSearch = {
  style: 'techno',
  genre: '',
  searchQuery: '',
  artist: '',
  label: '',
  country: '',
};

console.log('Testing style-only search parameters:', testStyleSearch);

// Check if the search validation passes
const hasSearchQuery = (testStyleSearch.searchQuery || '').trim().length > 0;
const hasFilters = Object.values(testStyleSearch).some(filter => filter && filter.toString().trim().length > 0);

console.log('Search validation:');
console.log('- Has search query:', hasSearchQuery);
console.log('- Has filters:', hasFilters);
console.log('- Should allow search:', hasSearchQuery || hasFilters);

// Check what parameters would be sent to API
const cleanParams = Object.fromEntries(
  Object.entries(testStyleSearch).filter(([_, value]) => value !== undefined && value !== '')
);

console.log('Clean parameters for API:', cleanParams);

// Build URL like the API does
const queryString = new URLSearchParams(cleanParams).toString();
console.log('Query string:', queryString);

export { testStyleSearch };
