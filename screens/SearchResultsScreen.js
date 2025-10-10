/**
 * OPTIMIZED SearchResultsScreen Implementation
 * 
 * Refactored with performance best practices:
 * - React.memo for prevention of unnecessary re-renders
 * - FlatList with windowSize and initialNumToRender optimization
 * - useCallback for stable function references
 * - useMemo for expensive computations  
 * - Virtual scrolling with getItemLayout
 * - Image lazy loading with proper cleanup
 * - Pagination virtualization
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApiRequest } from '../hooks/useApiRequest';
import sophisticatedTheme from '../styles/sophisticatedTheme';
import { formatPrice } from '../utils/format';

const { colors, spacing, typography, shadows } = sophisticatedTheme;

// ==========================================
// OPTIMIZED COMPONENTS
// ==========================================

/**
 * Optimized Record Item Component with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const OptimizedRecordItem = React.memo(({
  record,
  onPress,
  index,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Memoized image source computation
  const imageSource = useMemo(() => {
    const thumbnail = record.thumb || record.cover_image;
    return thumbnail && thumbnail !== '' && !imageError
      ? { uri: thumbnail }
      : require('../assets/images/icon.png');
  }, [record.thumb, record.cover_image, imageError]);

  // Optimized image loading handlers
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  // Memoized press handler with record data
  const handlePress = useCallback(() => {
    onPress(record);
  }, [onPress, record]);

  // Memoized formatted data
  const formattedData = useMemo(() => ({
    title: record.title || 'Unknown Title',
    artists: Array.isArray(record.artists) 
      ? record.artists.map(a => a.name).join(', ')
      : record.artist || 'Unknown Artist',
    label: Array.isArray(record.label) 
      ? record.label.map(l => l.name).join(', ')
      : record.label || 'Unknown Label',
    year: record.year ? `(${record.year})` : '',
    format: Array.isArray(record.format) 
      ? record.format.join(', ')
      : record.format || 'Unknown Format',
    genre: Array.isArray(record.genre) 
      ? record.genre.slice(0, 2).join(', ')
      : record.genre || 'Unknown Genre',
    style: Array.isArray(record.style) 
      ? record.style.slice(0, 2).join(', ')
      : record.style || '',
    country: record.country || 'Unknown',
    catno: record.catno || 'N/A',
    price: record.price ? formatPrice(record.price) : null,
  }), [record]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.recordItem,
        pressed && styles.recordItemPressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${formattedData.title} by ${formattedData.artists}`}
    >
      {/* Record Image with Loading States */}
      <View style={styles.imageContainer}>
        {imageLoading && !imageError && (
          <View style={styles.imageLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        <Image
          source={imageSource}
          style={styles.recordImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="cover"
          fadeDuration={200}
        />
        
        {/* Item Number Badge */}
        <View style={styles.itemBadge}>
          <Text style={styles.itemNumber}>{index + 1}</Text>
        </View>
      </View>

      {/* Record Information */}
      <View style={styles.recordInfo}>
        {/* Title and Artists */}
        <Text style={styles.recordTitle} numberOfLines={2}>
          {formattedData.title}
        </Text>
        
        <Text style={styles.recordArtist} numberOfLines={1}>
          {formattedData.artists}
        </Text>

        {/* Label and Year */}
        <Text style={styles.recordLabel} numberOfLines={1}>
          {formattedData.label} {formattedData.year}
        </Text>

        {/* Format and Genre */}
        <View style={styles.recordDetails}>
          <Text style={styles.recordFormat} numberOfLines={1}>
            {formattedData.format}
          </Text>
          
          {formattedData.genre && (
            <View style={styles.genreBadge}>
              <Text style={styles.genreText} numberOfLines={1}>
                {formattedData.genre}
              </Text>
            </View>
          )}
        </View>

        {/* Additional Info Row */}
        <View style={styles.additionalInfo}>
          <Text style={styles.catalogNumber}>
            {formattedData.country} • {formattedData.catno}
          </Text>
          
          {formattedData.price && (
            <Text style={styles.recordPrice}>{formattedData.price}</Text>
          )}
        </View>
      </View>

      {/* Action Arrow */}
      <View style={styles.actionContainer}>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textSecondary} 
        />
      </View>
    </Pressable>
  );
});

OptimizedRecordItem.displayName = 'OptimizedRecordItem';

/**
 * Optimized List Header Component
 */
const OptimizedListHeader = React.memo(({ 
  resultsCount, 
  searchQuery, 
  onNewSearch 
}) => (
  <View style={styles.headerContainer}>
    <Text style={styles.resultsCount}>
      {resultsCount.toLocaleString()} results found
    </Text>
    
    {searchQuery && (
      <Text style={styles.searchQueryDisplay}>
        for "{searchQuery}"
      </Text>
    )}
    
    <Pressable style={styles.newSearchButton} onPress={onNewSearch}>
      <Ionicons name="search" size={16} color={colors.primary} />
      <Text style={styles.newSearchText}>New Search</Text>
    </Pressable>
  </View>
));

OptimizedListHeader.displayName = 'OptimizedListHeader';

/**
 * Optimized List Footer Component for Loading States
 */
const OptimizedListFooter = React.memo(({ 
  isLoadingMore, 
  hasMore, 
  onLoadMore 
}) => {
  if (!isLoadingMore && !hasMore) {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.endOfResultsText}>
          End of results
        </Text>
      </View>
    );
  }

  if (isLoadingMore) {
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more results...</Text>
      </View>
    );
  }

  if (hasMore) {
    return (
      <Pressable style={styles.loadMoreButton} onPress={onLoadMore}>
        <Text style={styles.loadMoreText}>Load More Results</Text>
      </Pressable>
    );
  }

  return null;
});

OptimizedListFooter.displayName = 'OptimizedListFooter';

/**
 * Optimized Empty State Component
 */
const OptimizedEmptyState = React.memo(({ onNewSearch }) => (
  <View style={styles.emptyStateContainer}>
    <Ionicons name="musical-notes-outline" size={64} color={colors.textSecondary} />
    <Text style={styles.emptyStateTitle}>No Records Found</Text>
    <Text style={styles.emptyStateText}>
      Try adjusting your search terms or filters to find what you're looking for.
    </Text>
    <Pressable style={styles.newSearchButton} onPress={onNewSearch}>
      <Text style={styles.newSearchText}>Start New Search</Text>
    </Pressable>
  </View>
));

OptimizedEmptyState.displayName = 'OptimizedEmptyState';

// ==========================================
// MAIN COMPONENT
// ==========================================

const OptimizedSearchResultsScreen = ({ 
  initialResults, 
  searchQuery, 
  searchParams 
}) => {
  // State management
  const [records, setRecords] = useState(initialResults?.results || []);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // API and utility hooks
  const { executeRequest } = useApiRequest();
  
  // Refs for performance optimization
  const flatListRef = useRef(null);
  const mounted = useRef(true);

  // Memoized computed values
  const pagination = useMemo(() => 
    initialResults?.pagination || { items: 0, pages: 0, page: 1, per_page: 50 },
    [initialResults]
  );

  const hasMore = useMemo(() => 
    currentPage < pagination.pages,
    [currentPage, pagination.pages]
  );

  const resultsCount = useMemo(() => 
    pagination.items || records.length,
    [pagination.items, records.length]
  );

  // ==========================================
  // OPTIMIZED EVENT HANDLERS
  // ==========================================

  /**
   * Optimized record press handler with navigation
   */
  const handleRecordPress = useCallback((record) => {
    console.log('📀 Opening record details:', record.title);
    
    router.push({
      pathname: '/record-detail',
      params: {
        recordId: record.id.toString(),
        record: JSON.stringify({
          id: record.id,
          title: record.title,
          artists: record.artists || [{ name: record.artist || 'Unknown Artist' }],
          year: record.year,
          thumb: record.thumb || record.cover_image,
          cover_image: record.cover_image || record.thumb,
          label: record.label,
          country: record.country,
          format: record.format,
          genre: record.genre,
          style: record.style,
          catno: record.catno,
        })
      }
    });
  }, []);

  /**
   * Optimized pagination handler with error handling
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const paginatedParams = {
        ...JSON.parse(searchParams || '{}'),
        page: nextPage,
      };

      console.log(`📄 Loading page ${nextPage} of search results...`);

      const response = await executeRequest(async () => {
        // Import advancedSearch here to avoid circular dependencies
        const { advancedSearch } = require('../api/discogs');
        return await advancedSearch(paginatedParams);
      });

      if (mounted.current && response?.results) {
        setRecords(prevRecords => [
          ...prevRecords,
          ...response.results.filter(newRecord => 
            !prevRecords.some(existingRecord => existingRecord.id === newRecord.id)
          )
        ]);
        setCurrentPage(nextPage);
        
        console.log(`✅ Loaded ${response.results.length} more results`);
      }

    } catch (error) {
      console.error('❌ Failed to load more results:', error);
      if (mounted.current) {
        setError('Failed to load more results. Please try again.');
      }
    } finally {
      if (mounted.current) {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, hasMore, currentPage, searchParams, executeRequest]);

  /**
   * Optimized new search navigation
   */
  const handleNewSearch = useCallback(() => {
    console.log('🔍 Starting new search...');
    router.back();
  }, []);

  // ==========================================
  // FLATLIST OPTIMIZATION
  // ==========================================

  /**
   * Optimized item layout calculation for better scrolling performance
   */
  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  /**
   * Optimized key extractor for FlatList
   */
  const keyExtractor = useCallback((item) => `record-${item.id}`, []);

  /**
   * Optimized render item function with memoization
   */
  const renderItem = useCallback(({ item, index }) => (
    <OptimizedRecordItem
      record={item}
      onPress={handleRecordPress}
      index={index}
    />
  ), [handleRecordPress]);

  /**
   * Memoized list header
   */
  const listHeader = useMemo(() => (
    <OptimizedListHeader
      resultsCount={resultsCount}
      searchQuery={searchQuery}
      onNewSearch={handleNewSearch}
    />
  ), [resultsCount, searchQuery, handleNewSearch]);

  /**
   * Memoized list footer
   */
  const listFooter = useMemo(() => (
    <OptimizedListFooter
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
    />
  ), [isLoadingMore, hasMore, handleLoadMore]);

  // ==========================================
  // LIFECYCLE MANAGEMENT
  // ==========================================

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  if (records.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <OptimizedEmptyState onNewSearch={handleNewSearch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={records}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        
        // Performance Optimizations
        windowSize={10}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        
        // Header and Footer
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        
        // Pagination
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        
        // Styling
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        
        // Accessibility
        accessibilityRole="list"
        accessibilityLabel={`Search results list with ${resultsCount} records`}
      />

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable 
            style={styles.errorDismiss}
            onPress={() => setError(null)}
          >
            <Ionicons name="close" size={16} color={colors.error} />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

// ==========================================
// CONSTANTS AND STYLES
// ==========================================

const { width: screenWidth } = Dimensions.get('window');
const ITEM_HEIGHT = 120; // Fixed item height for getItemLayout optimization

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flatList: {
    flex: 1,
  },

  flatListContent: {
    paddingBottom: spacing.xl,
  },

  // Header Styles
  headerContainer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },

  resultsCount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  searchQueryDisplay: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },

  newSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    gap: spacing.xs,
  },

  newSearchText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },

  // Record Item Styles
  recordItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: ITEM_HEIGHT,
  },

  recordItemPressed: {
    backgroundColor: colors.surfaceVariant,
  },

  imageContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },

  recordImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },

  imageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    zIndex: 1,
  },

  itemBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },

  itemNumber: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },

  recordInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  recordTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    lineHeight: 20,
  },

  recordArtist: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },

  recordLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  recordDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  recordFormat: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },

  genreBadge: {
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  genreText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: typography.fontWeight.medium,
  },

  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  catalogNumber: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },

  recordPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.success || colors.primary,
  },

  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.sm,
  },

  // Footer Styles
  footerContainer: {
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.xs,
  },

  loadingMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  endOfResultsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  loadMoreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    margin: spacing.base,
    alignItems: 'center',
  },

  loadMoreText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.surface,
  },

  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
  },

  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },

  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Error Styles
  errorBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.error,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    flex: 1,
  },

  errorDismiss: {
    padding: spacing.xs,
  },
});

export default OptimizedSearchResultsScreen;