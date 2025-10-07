/**
 * SearchResults Component
 * 
 * Displays search results from Discogs API in a user-friendly format.
 * Shows record information including title, artist, year, format, and images.
 * 
 * Features:
 * - Card-based layout for each record
 * - Image thumbnails with fallback
 * - Formatted metadata display
 * - Loading states and error handling
 * - Empty state messaging
 * - Pagination support (future enhancement)
 */

import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../styles/theme';

const SearchResults = ({ 
  results, 
  isLoading, 
  error, 
  onItemPress,
  onLoadMore,
  hasNextPage = false 
}) => {
  
  /**
   * Render individual search result item
   */
  const renderResultItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => onItemPress?.(item)}
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
        
        {/* Metadata Row */}
        <View style={styles.metadataRow}>
          {/* Year */}
          {item.year && (
            <Text style={styles.metadataText}>{item.year}</Text>
          )}
          
          {/* Format */}
          {item.format && (
            <>
              {item.year && <Text style={styles.separator}>•</Text>}
              <Text style={styles.metadataText}>{item.format}</Text>
            </>
          )}
        </View>
        
        {/* Label */}
        {item.label && (
          <Text style={styles.labelText} numberOfLines={1}>
            {item.label}
          </Text>
        )}
        
        {/* Genre/Style */}
        {(item.genre || item.style) && (
          <View style={styles.genreRow}>
            {item.genre && (
              <View style={styles.genreTag}>
                <Text style={styles.genreTagText}>{item.genre.split(',')[0]}</Text>
              </View>
            )}
            {item.style && item.style !== item.genre && (
              <View style={styles.styleTag}>
                <Text style={styles.styleTagText}>{item.style.split(',')[0]}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Community Stats */}
        {item.community && (item.community.want > 0 || item.community.have > 0) && (
          <View style={styles.communityRow}>
            <Text style={styles.communityText}>
              ❤️ {item.community.want} want • 💿 {item.community.have} have
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  
  /**
   * Render loading footer for pagination
   */
  const renderFooter = () => {
    if (!isLoading || !hasNextPage) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading more results...</Text>
      </View>
    );
  };
  
  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Searching Discogs database...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Search Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyText}>No Results Found</Text>
        <Text style={styles.emptyMessage}>
          Try adjusting your search criteria or filters
        </Text>
      </View>
    );
  };
  
  /**
   * Handle end reached for pagination
   */
  const handleEndReached = () => {
    if (hasNextPage && !isLoading) {
      onLoadMore?.();
    }
  };
  
  // Show empty state if no results
  if (!results || results.length === 0) {
    return renderEmptyState();
  }
  
  return (
    <View style={styles.container}>
      {/* Results Header */}
      <View style={styles.header}>
        <Text style={styles.resultCount}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {/* Results Grid */}
      <FlatList
        key="grid-2-columns" // Force re-render when numColumns changes
        data={results}
        renderItem={renderResultItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  
  resultCount: {
    color: colors.textAccent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  // List
  listContent: {
    padding: spacing.base,
  },
  
  // Row for grid layout
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  
  // Result Card
  resultCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    padding: spacing.sm,
    flexDirection: 'column',
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
    color: colors.textAccent,
    marginBottom: spacing.xs,
  },
  
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  metadataText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  separator: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  
  labelText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  
  // Tags
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  
  genreTag: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  
  genreTagText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.background,
  },
  
  styleTag: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  
  styleTagText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  
  // Community
  communityRow: {
    marginTop: spacing.xs,
  },
  
  communityText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  
  // Loading Footer
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  
  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  emptyMessage: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

export default SearchResults;