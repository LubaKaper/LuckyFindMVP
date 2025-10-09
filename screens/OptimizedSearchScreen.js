/**
 * OPTIMIZED SearchScreen Implementation
 * 
 * Refactored with performance best practices:
 * - useReducer for state management (reduces re-renders)
 * - useCallback for stable function references  
 * - useMemo for expensive computations
 * - Proper cleanup and memory management
 * - Debounced input handling
 * - Request deduplication
 */

import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import optimized components and hooks
import { Button, Input, OptimizedDropdown } from '../components';
import { advancedSearch, searchLabelsByReleaseCount } from '../api/discogs';
import { useApiRequest } from '../hooks/useApiRequest';
import { useDebounce } from '../hooks/useDebounce';
import { colors, spacing, typography } from '../styles/theme';

// ==========================================
// STATE MANAGEMENT WITH useReducer
// ==========================================

const SEARCH_ACTIONS = {
  SET_QUERY: 'SET_QUERY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR', 
  SET_RATE_LIMIT_WARNING: 'SET_RATE_LIMIT_WARNING',
  SET_OPEN_DROPDOWN: 'SET_OPEN_DROPDOWN',
  UPDATE_FILTER: 'UPDATE_FILTER',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
};

const initialSearchState = {
  searchQuery: '',
  isLoading: false,
  error: null,
  showRateLimitWarning: false,
  openDropdown: null,
  filters: {
    genre: '',
    style: '',
    artist: '',
    label: '',
    country: '',
    yearFrom: '',
    yearTo: '',
    minPrice: '',
    maxPrice: '',
    maxReleases: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 50,
  }
};

/**
 * Optimized reducer for search state management
 * Reduces component re-renders by batching related state updates
 */
const searchReducer = (state, action) => {
  switch (action.type) {
    case SEARCH_ACTIONS.SET_QUERY:
      return { ...state, searchQuery: action.payload };
    
    case SEARCH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case SEARCH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case SEARCH_ACTIONS.SET_RATE_LIMIT_WARNING:
      return { ...state, showRateLimitWarning: action.payload };
    
    case SEARCH_ACTIONS.SET_OPEN_DROPDOWN:
      return { ...state, openDropdown: action.payload };
    
    case SEARCH_ACTIONS.UPDATE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        }
      };
    
    case SEARCH_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        filters: initialSearchState.filters,
        openDropdown: null,
      };
    
    case SEARCH_ACTIONS.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    
    default:
      return state;
  }
};

// ==========================================
// FILTER OPTIONS (Memoized)
// ==========================================

const FILTER_OPTIONS = {
  genre: [
    { label: 'All Genres', value: '' },
    { label: 'Electronic', value: 'electronic' },
    { label: 'Rock', value: 'rock' },
    { label: 'Jazz', value: 'jazz' },
    { label: 'Hip Hop', value: 'hiphop' },
    { label: 'Blues', value: 'blues' },
    { label: 'Classical', value: 'classical' },
    { label: 'Pop', value: 'pop' },
    { label: 'Reggae', value: 'reggae' },
    { label: 'Country', value: 'country' },
  ],
  
  style: [
    { label: 'All Styles', value: '' },
    { label: 'Techno', value: 'techno' },
    { label: 'House', value: 'house' },
    { label: 'Tech House', value: 'tech house' },
    { label: 'Deep House', value: 'deep house' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Electro', value: 'electro' },
    { label: 'Trance', value: 'trance' },
    { label: 'Drum & Bass', value: 'drum n bass' },
    { label: 'Dubstep', value: 'dubstep' },
  ],

  country: [
    { label: 'All Countries', value: '' },
    { label: 'US', value: 'US' },
    { label: 'UK', value: 'UK' },
    { label: 'Germany', value: 'Germany' },
    { label: 'France', value: 'France' },
    { label: 'Japan', value: 'Japan' },
    { label: 'Netherlands', value: 'Netherlands' },
    { label: 'Canada', value: 'Canada' },
  ]
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const OptimizedSearchScreen = () => {
  // Optimized state management with useReducer
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);
  const {
    searchQuery,
    isLoading,
    error,
    showRateLimitWarning,
    openDropdown,
    filters,
    pagination
  } = state;

  // Hooks for API requests and debouncing
  const { executeRequest, cancelRequest } = useApiRequest();
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Refs for cleanup and performance
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // ==========================================
  // MEMOIZED COMPUTATIONS
  // ==========================================

  /**
   * Memoized validation check for search readiness
   * Prevents unnecessary re-computation on every render
   */
  const canSearch = useMemo(() => {
    const hasSearchQuery = debouncedQuery.trim().length > 0;
    const hasFilters = Object.values(filters).some(filter => 
      filter && filter.toString().trim().length > 0
    );
    return hasSearchQuery || hasFilters;
  }, [debouncedQuery, filters]);

  /**
   * Memoized search parameters
   * Only recomputes when relevant dependencies change
   */
  const searchParams = useMemo(() => ({
    searchQuery: debouncedQuery.trim() || undefined,
    genre: filters.genre || undefined,
    style: filters.style || undefined,
    artist: filters.artist || undefined,
    label: filters.label || undefined,
    country: filters.country || undefined,
    yearFrom: parseInt(filters.yearFrom) || undefined,
    yearTo: parseInt(filters.yearTo) || undefined,
    priceMin: parseInt(filters.minPrice) || undefined,
    priceMax: parseInt(filters.maxPrice) || undefined,
    page: pagination.currentPage,
    per_page: pagination.itemsPerPage,
  }), [debouncedQuery, filters, pagination]);

  // ==========================================
  // OPTIMIZED EVENT HANDLERS
  // ==========================================

  /**
   * Optimized query change handler with useCallback
   * Prevents unnecessary re-renders of child components
   */
  const handleQueryChange = useCallback((text) => {
    dispatch({ type: SEARCH_ACTIONS.SET_QUERY, payload: text });
  }, []);

  /**
   * Optimized filter update handler
   * Batches filter updates to reduce re-renders
   */
  const handleFilterChange = useCallback((key, value) => {
    dispatch({
      type: SEARCH_ACTIONS.UPDATE_FILTER,
      payload: { key, value }
    });
  }, []);

  /**
   * Optimized dropdown toggle handler
   * Manages dropdown state efficiently
   */
  const handleDropdownToggle = useCallback((dropdownName) => {
    const newOpenDropdown = openDropdown === dropdownName ? null : dropdownName;
    dispatch({ type: SEARCH_ACTIONS.SET_OPEN_DROPDOWN, payload: newOpenDropdown });
  }, [openDropdown]);

  /**
   * Optimized reset filters handler
   * Resets all filters and closes dropdowns in one action
   */
  const handleResetFilters = useCallback(() => {
    dispatch({ type: SEARCH_ACTIONS.RESET_FILTERS });
  }, []);

  /**
   * Optimized search execution with proper error handling
   * Includes rate limit management and cleanup
   */
  const handleSearch = useCallback(async () => {
    if (!canSearch) {
      Alert.alert(
        'Search Required',
        'Please enter a search term or select at least one filter to find records.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Close any open dropdowns
    dispatch({ type: SEARCH_ACTIONS.SET_OPEN_DROPDOWN, payload: null });
    dispatch({ type: SEARCH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: SEARCH_ACTIONS.SET_ERROR, payload: null });

    try {
      console.log('🔍 Optimized search with parameters:', searchParams);

      let results;

      // Handle label release count filtering
      if (filters.maxReleases) {
        const minReleases = 0;
        const maxReleases = parseInt(filters.maxReleases) || Infinity;
        
        const filteredLabels = await executeRequest(
          async () => await searchLabelsByReleaseCount(
            filters.label || debouncedQuery.trim(),
            minReleases,
            maxReleases
          )
        );

        if (filteredLabels.length === 0) {
          results = {
            results: [],
            pagination: { items: 0, pages: 0, page: 1, per_page: 50 }
          };
        } else {
          // Search releases from filtered labels
          const labelNames = filteredLabels.map(label => label.title).slice(0, 5);
          const labelSearchPromises = labelNames.map(labelName => 
            executeRequest(async () => 
              await advancedSearch({ ...searchParams, label: labelName })
            )
          );

          const labelResults = await Promise.all(labelSearchPromises);
          
          // Combine and deduplicate results
          const combinedResults = labelResults.reduce((acc, result) => {
            if (result.results) acc.push(...result.results);
            return acc;
          }, []);

          const uniqueResults = combinedResults.filter((record, index, self) => 
            index === self.findIndex(r => r.id === record.id)
          );

          results = {
            results: uniqueResults.slice(0, 50),
            pagination: { 
              items: uniqueResults.length, 
              pages: Math.ceil(uniqueResults.length / 50), 
              page: 1, 
              per_page: 50 
            }
          };
        }
      } else {
        // Regular search
        results = await executeRequest(
          async () => await advancedSearch(searchParams)
        );
      }

      console.log(`✅ Optimized search completed. Found ${results.pagination?.items || 0} results`);

      // Navigate to results screen
      if (results.pagination?.items > 0) {
        router.push({
          pathname: '/search-results',
          params: {
            initialResults: JSON.stringify(results),
            searchQuery: debouncedQuery.trim(),
            searchParams: JSON.stringify(searchParams),
          }
        });
      } else {
        Alert.alert(
          'No Results',
          'No records found matching your search criteria. Try adjusting your filters or search terms.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('❌ Optimized search failed:', error.message);
      
      // Enhanced error handling with rate limit management
      let errorTitle = 'Search Error';
      let errorMessage = 'Failed to search records. Please try again.';
      
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        errorTitle = 'Authentication Error';
        errorMessage = 'There was an issue with API authentication. Please try again in a moment.';
      } else if (error.message.includes('Rate limit') || error.message.includes('429')) {
        errorTitle = 'Rate Limit Reached';
        errorMessage = 'The Discogs API is temporarily limiting requests. Please wait 30-60 seconds before searching again.';
        
        // Show rate limit warning
        dispatch({ type: SEARCH_ACTIONS.SET_RATE_LIMIT_WARNING, payload: true });
        
        // Auto-hide warning after 30 seconds
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            dispatch({ type: SEARCH_ACTIONS.SET_RATE_LIMIT_WARNING, payload: false });
          }
        }, 30000);
        
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      }
      
      dispatch({ type: SEARCH_ACTIONS.SET_ERROR, payload: errorMessage });
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
      
    } finally {
      if (mountedRef.current) {
        dispatch({ type: SEARCH_ACTIONS.SET_LOADING, payload: false });
      }
    }
  }, [canSearch, searchParams, debouncedQuery, filters, executeRequest]);

  // ==========================================
  // LIFECYCLE MANAGEMENT
  // ==========================================

  /**
   * Component lifecycle management with proper cleanup
   */
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cancelRequest();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cancelRequest]);

  // ==========================================
  // RENDER OPTIMIZATION
  // ==========================================

  /**
   * Memoized dropdown render function
   * Prevents unnecessary re-renders of dropdown components
   */
  const renderDropdown = useCallback((type, label, options) => (
    <OptimizedDropdown
      key={type}
      label={label}
      value={filters[type]}
      onValueChange={(value) => handleFilterChange(type, value)}
      options={options}
      isOpen={openDropdown === type}
      onToggle={() => handleDropdownToggle(type)}
      placeholder={`Select ${label.toLowerCase()}...`}
    />
  ), [filters, openDropdown, handleFilterChange, handleDropdownToggle]);

  /**
   * Memoized text input render function  
   */
  const renderTextInput = useCallback((key, label, placeholder, keyboardType = 'default') => (
    <Input
      key={key}
      label={label}
      value={filters[key]}
      onChangeText={(text) => handleFilterChange(key, text)}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  ), [filters, handleFilterChange]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>Search Records</Text>
        <Text style={styles.searchDescription}>
          Search millions of records in the world's largest music database.
        </Text>
        
        {/* Rate Limit Warning */}
        {showRateLimitWarning && (
          <View style={styles.rateLimitWarning}>
            <Text style={styles.rateLimitText}>
              ⏳ API rate limit active. Searches are temporarily slowed to prevent errors.
            </Text>
          </View>
        )}

        {/* Search Input */}
        <Input
          label="Search Query"
          value={searchQuery}
          onChangeText={handleQueryChange}
          placeholder="Search records, artists, albums... (optional)"
          onSubmitEditing={handleSearch}
        />

        {/* Search Button */}
        <Button
          title={isLoading ? "Searching..." : "Search Records"}
          onPress={handleSearch}
          disabled={isLoading || !canSearch}
          style={styles.searchButton}
        />

        {/* Advanced Filters */}
        <Text style={styles.sectionTitle}>Advanced Filters</Text>
        
        {/* Dropdown Filters */}
        {renderDropdown('genre', 'Genre', FILTER_OPTIONS.genre)}
        {renderDropdown('style', 'Style', FILTER_OPTIONS.style)}
        {renderDropdown('country', 'Country', FILTER_OPTIONS.country)}

        {/* Text Input Filters */}
        {renderTextInput('artist', 'Artist', 'Enter artist name...')}
        {renderTextInput('label', 'Label', 'Enter record label...')}
        {renderTextInput('yearFrom', 'Year From', 'e.g., 1970', 'numeric')}
        {renderTextInput('yearTo', 'Year To', 'e.g., 2020', 'numeric')}
        {renderTextInput('minPrice', 'Min Price ($)', 'e.g., 10', 'numeric')}
        {renderTextInput('maxPrice', 'Max Price ($)', 'e.g., 100', 'numeric')}
        {renderTextInput('maxReleases', 'Max Label Releases', 'Filter labels by release count', 'numeric')}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Reset Filters"
            onPress={handleResetFilters}
            variant="secondary"
            style={styles.resetButton}
          />
          
          <Button
            title={isLoading ? "Searching..." : "Search Records"}
            onPress={handleSearch}
            disabled={isLoading || !canSearch}
            style={styles.searchButtonBottom}
          />
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// OPTIMIZED STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },

  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  searchDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },

  searchButton: {
    marginVertical: spacing.md,
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },

  resetButton: {
    flex: 1,
  },

  searchButtonBottom: {
    flex: 1,
  },

  // Rate limit warning
  rateLimitWarning: {
    backgroundColor: colors.warning || '#FFF3CD',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.base,
  },

  rateLimitText: {
    color: colors.warningText || '#856404',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },

  // Error display
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
  },

  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
});

export default OptimizedSearchScreen;