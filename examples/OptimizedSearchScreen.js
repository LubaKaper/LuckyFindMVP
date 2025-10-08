/**
 * EXAMPLE: Optimized SearchScreen Implementation
 * 
 * This demonstrates how to refactor the existing SearchScreen.js to use
 * the new performance-optimized hooks and patterns.
 * 
 * Key Improvements:
 * 1. useSearchState for optimized state management
 * 2. useApiRequest for memory-safe API calls
 * 3. useDebounce for efficient user input handling
 * 4. Memoized callbacks to prevent unnecessary re-renders
 * 5. Proper cleanup and cancellation
 */

import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

// Import optimized hooks and components
import { advancedSearch } from '../api/discogs';
import { Button, Dropdown, Input } from '../components';
import { useApiRequest } from '../hooks/useApiRequest';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchState } from '../hooks/useSearchState';
import { colors, commonStyles, spacing, typography } from '../styles/theme';

const OptimizedSearchScreen = () => {
  // Use optimized search state hook
  const {
    query,
    results,
    filters,
    loading,
    error,
    canSearch,
    searchParams,
    setQuery,
    updateFilter,
    resetFilters,
    setLoading,
    setError,
  } = useSearchState();

  // Use API request hook for memory-safe requests
  const { executeRequest, cancelRequest } = useApiRequest();

  // Debounce search query to prevent excessive API calls
  const debouncedQuery = useDebounce(query, 500);

  // Filter options (memoized to prevent re-creation)
  const filterOptions = React.useMemo(() => ({
    genre: [
      { label: 'All Genres', value: '' },
      { label: 'Electronic', value: 'electronic' },
      { label: 'Rock', value: 'rock' },
      { label: 'Jazz', value: 'jazz' },
      // ... other genres
    ],
    style: [
      { label: 'All Styles', value: '' },
      { label: 'Techno', value: 'techno' },
      { label: 'House', value: 'house' },
      // ... other styles
    ],
    // ... other filter options
  }), []);

  // Dropdown state management
  const [openDropdown, setOpenDropdown] = React.useState(null);

  // Memoized dropdown toggle handler
  const handleDropdownToggle = useCallback((dropdownName) => {
    setOpenDropdown(current => current === dropdownName ? null : dropdownName);
  }, []);

  // Memoized filter update handler
  const handleFilterUpdate = useCallback((filterName, value) => {
    updateFilter(filterName, value);
  }, [updateFilter]);

  // Memoized search handler with proper error handling
  const handleSearch = useCallback(async () => {
    if (!canSearch) {
      Alert.alert(
        'Search Required',
        'Please enter a search term or select at least one filter.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setOpenDropdown(null);

      // Use executeRequest for automatic cleanup
      const results = await executeRequest(
        async (signal) => {
          // Create API request with abort signal
          const controller = new AbortController();
          signal?.addEventListener('abort', () => controller.abort());
          
          return await advancedSearch({
            ...searchParams,
            signal: controller.signal,
          });
        }
      );

      if (results && results.pagination?.items > 0) {
        router.push({
          pathname: '/search-results',
          params: {
            initialResults: JSON.stringify(results),
            searchQuery: query,
            searchParams: JSON.stringify(searchParams),
          }
        });
      } else {
        Alert.alert(
          'No Results',
          'No records found matching your criteria.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Search failed:', error.message);
        setError(error.message);
        
        Alert.alert(
          'Search Error',
          'Failed to search records. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [canSearch, searchParams, query, executeRequest, setLoading, setError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  // Auto-search when debounced query changes (optional feature)
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 3) {
      // Could implement auto-search here if desired
      console.log('Debounced query ready for search:', debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Search Records</Text>
        
        <Text style={styles.searchDescription}>
          Search millions of records in the world's largest music database.
        </Text>

        {/* Main Search Input */}
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search records, artists, albums..."
          label="Search Query"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        {/* Search Button */}
        <Button
          title={loading ? "Searching..." : "Search Records"}
          onPress={handleSearch}
          disabled={loading || !canSearch}
          style={styles.searchButton}
        />

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          
          {/* Genre Filter */}
          <Dropdown
            label="Genre"
            value={filters.genre}
            onValueChange={(value) => handleFilterUpdate('genre', value)}
            options={filterOptions.genre}
            isOpen={openDropdown === 'genre'}
            onToggle={() => handleDropdownToggle('genre')}
            placeholder="Select genre..."
          />
          
          {/* Style Filter */}
          <Dropdown
            label="Style"
            value={filters.style}
            onValueChange={(value) => handleFilterUpdate('style', value)}
            options={filterOptions.style}
            isOpen={openDropdown === 'style'}
            onToggle={() => handleDropdownToggle('style')}
            placeholder="Select style..."
          />

          {/* Artist Filter */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Artist (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={filters.artist}
              onChangeText={(text) => handleFilterUpdate('artist', text)}
              placeholder="Enter artist name..."
              placeholderTextColor="rgba(255, 255, 0, 0.5)"
            />
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={loading ? "Searching..." : "Search Records"}
            onPress={handleSearch}
            disabled={loading || !canSearch}
            style={styles.searchButton}
          />
          
          <Button
            title="Reset Search"
            onPress={resetFilters}
            variant="outline"
            disabled={loading}
            style={styles.resetButton}
          />
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(OptimizedSearchScreen);

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    ...commonStyles.contentContainer,
  },
  
  title: {
    ...commonStyles.title,
    marginBottom: spacing.md,
  },
  
  searchDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  
  filtersSection: {
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    ...commonStyles.subtitle,
    marginBottom: spacing.lg,
  },
  
  inputContainer: {
    marginBottom: spacing.md,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.accent,
    minHeight: 48,
  },
  
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  
  searchButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  resetButton: {
    // Outline button styling from Button component
  },
  
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
});