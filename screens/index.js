/**
 * Screens Index File
 * 
 * Centralized export file for all screen components.
 * This allows for cleaner imports and better organization.
 * 
 * Usage:
 * import { SearchScreen } from '../screens';
 */

// Main Screens
export { default as SearchScreen } from './SearchScreen';

// Export all screens as a single object for flexibility
export default {
  SearchScreen: require('./SearchScreen').default,
};