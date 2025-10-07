/**
 * SearchResultsScreen Component
 * 
 * Displays paginated search results in a 2-column grid with navigation controls.
 * Handles pagination with Previous/Next buttons and shows 30 results per page.
 * 
 * Features:
 * - Compact search header for new searches
 * - Pagination controls at top and bottom
 * - 2-column grid layout optimized for mobile
 * - Navigation to detail view
 * - Loading states and error handling
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';
import { borderRadius, colors, shadows, spacing, typography } from '../styles/theme';

const SearchResultsScreen = () => {
  const params = useLocalSearchParams();
  const initialResults = params.initialResults ? JSON.parse(params.initialResults) : null;
  const initialQuery = params.searchQuery || '';
  const searchParams = params.searchParams ? JSON.parse(params.searchParams) : {};
  
  // State management
  const [results, setResults] = useState(initialResults?.results || []);
  const [pagination, setPagination] = useState(initialResults?.pagination || {});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [error, setError] = useState(null);

  // Results per page
  const RESULTS_PER_PAGE = 30;

  /**
   * Handle navigation back to search screen
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * Handle navigation to record detail
   */
  const handleRecordPress = (record) => {
    console.log('Selected record:', record);
    router.push({
      pathname: '/record-detail',
      params: { record: JSON.stringify(record) }
    });
  };

  /**
   * Perform new search
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      // Import the search function dynamically to avoid circular deps
      const { advancedSearch } = require('../api/discogs');
      
      const searchParameters = {
        ...searchParams,
        searchQuery: searchQuery.trim(),
        page: 1,
        per_page: RESULTS_PER_PAGE,
      };

      const response = await advancedSearch(searchParameters);
      setResults(response.results || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error('❌ Search failed:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load specific page
   */
  const loadPage = async (page) => {
    if (isLoading || page < 1) return;

    setIsLoading(true);
    setError(null);

    try {
      const { advancedSearch } = require('../api/discogs');
      
      const searchParameters = {
        ...searchParams,
        searchQuery: searchQuery.trim(),
        page: page,
        per_page: RESULTS_PER_PAGE,
      };

      const response = await advancedSearch(searchParameters);
      setResults(response.results || []);
      setPagination(response.pagination || {});
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ Page load failed:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle previous page
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  };

  /**
   * Handle next page
   */
  const handleNextPage = () => {
    const totalPages = pagination.pages || Math.ceil((pagination.items || 0) / RESULTS_PER_PAGE);
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  };

  /**
   * Render individual result item
   */
  const renderResultItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.8}
    >
      {/* Album Art */}
      <View style={styles.imageContainer}>
        {item.thumb ? (
          <Image
            source={{ uri: item.thumb }}
            style={styles.albumImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>♪</Text>
          </View>
        )}
      </View>
      
      {/* Record Information */}
      <View style={styles.infoContainer}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title || 'Unknown Title'}
        </Text>
        
        {/* Artist */}
        {item.artist && (
          <Text style={styles.artist} numberOfLines={1}>
            {item.artist}
          </Text>
        )}
        
        {/* Year */}
        {item.year && (
          <Text style={styles.year}>{item.year}</Text>
        )}
        
        {/* Genre */}
        {item.genre && (
          <View style={styles.genreContainer}>
            <Text style={styles.genreText} numberOfLines={1}>
              {typeof item.genre === 'string' ? item.genre.split(',')[0] : item.genre}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  /**
   * Render pagination controls
   */
  const renderPaginationControls = () => {
    const totalPages = pagination.pages || Math.ceil((pagination.items || 0) / RESULTS_PER_PAGE);
    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, !hasPrevious && styles.disabledButton]}
          onPress={handlePreviousPage}
          disabled={!hasPrevious || isLoading}
        >
          <Text style={[styles.paginationButtonText, !hasPrevious && styles.disabledButtonText]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
          <Text style={styles.resultsText}>
            {pagination.items || 0} total results
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.paginationButton, !hasNext && styles.disabledButton]}
          onPress={handleNextPage}
          disabled={!hasNext || isLoading}
        >
          <Text style={[styles.paginationButtonText, !hasNext && styles.disabledButtonText]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.loadingText}>Loading results...</Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>Search Error</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <Button
        title="Try Again"
        onPress={handleSearch}
        style={styles.retryButton}
      />
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyText}>No Results Found</Text>
      <Text style={styles.emptyMessage}>
        Try adjusting your search criteria
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Search</Text>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search records, artists, albums..."
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
          />
          <Button
            title="Search"
            onPress={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            style={styles.searchButton}
          />
        </View>
      </View>

      {/* Content */}
      {isLoading && results.length === 0 ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : results.length === 0 ? (
        renderEmpty()
      ) : (
        <View style={styles.content}>
          {/* Top Pagination */}
          {renderPaginationControls()}
          
          {/* Results Grid */}
          <FlatList
            key="search-results-grid"
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Bottom Pagination */}
          {renderPaginationControls()}
        </View>
      )}
      
      {/* Loading Overlay */}
      {isLoading && results.length > 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
    gap: spacing.sm,
  },

  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },

  backButtonText: {
    color: colors.accent,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },

  searchInput: {
    flex: 1,
  },

  searchButton: {
    minWidth: 80,
  },

  // Content
  content: {
    flex: 1,
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },

  paginationButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
    backgroundColor: colors.accent,
    minWidth: 80,
  },

  disabledButton: {
    backgroundColor: colors.backgroundSecondary,
  },

  paginationButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  disabledButtonText: {
    color: colors.textSecondary,
  },

  pageInfo: {
    alignItems: 'center',
  },

  pageText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  resultsText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  // Results Grid
  listContent: {
    padding: spacing.base,
  },

  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },

  resultCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    marginBottom: spacing.base,
    padding: spacing.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },

  // Image
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
  },

  albumImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.base,
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.base,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
  },

  // Info
  infoContainer: {
    flex: 1,
  },

  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  artist: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent,
    marginBottom: spacing.xs,
  },

  year: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  genreContainer: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },

  genreText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    marginTop: spacing.md,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.sm,
  },

  errorMessage: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  retryButton: {
    minWidth: 120,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  emptyText: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.sm,
  },

  emptyMessage: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
});

export default SearchResultsScreen;