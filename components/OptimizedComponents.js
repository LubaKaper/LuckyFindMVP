/**
 * Optimized Components with React.memo
 * 
 * Memoized components to prevent unnecessary re-renders and improve performance.
 * These components only re-render when their props actually change.
 */

import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../styles/theme';

/**
 * Memoized Record Card Component
 * Only re-renders when record data changes
 */
export const RecordCard = React.memo(({ record, onPress }) => {
  const handlePress = React.useCallback(() => {
    onPress(record);
  }, [record, onPress]);

  return (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Album Art */}
      <View style={styles.imageContainer}>
        {(record.imageUrl || record.thumb) ? (
          <Image
            source={{ uri: record.imageUrl || record.thumb }}
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
        <Text style={styles.title} numberOfLines={2}>
          {record.title || 'Unknown Title'}
        </Text>
        
        {record.artist && (
          <Text style={styles.artist} numberOfLines={1}>
            {record.artist}
          </Text>
        )}
        
        {record.year && (
          <Text style={styles.year}>{record.year}</Text>
        )}
        
        {(record.label || (record.labels && record.labels.length > 0)) && (
          <Text style={styles.label} numberOfLines={1}>
            📀 {record.label || record.labels[0] || ''}
          </Text>
        )}
        
        {record.country && (
          <Text style={styles.country} numberOfLines={1}>
            🌍 {record.country}
          </Text>
        )}
        
        {((record.genres && record.genres.length > 0) || record.genre) && (
          <View style={styles.genreContainer}>
            <Text style={styles.genreText} numberOfLines={1}>
              {record.genres && record.genres.length > 0 
                ? record.genres[0] 
                : (typeof record.genre === 'string' ? record.genre.split(',')[0] : record.genre)
              }
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

/**
 * Memoized Pagination Controls Component
 */
export const PaginationControls = React.memo(({ 
  currentPage, 
  totalPages, 
  totalItems, 
  onPrevious, 
  onNext, 
  loading 
}) => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrevious = React.useCallback(() => {
    if (hasPrevious && !loading) {
      onPrevious();
    }
  }, [hasPrevious, loading, onPrevious]);

  const handleNext = React.useCallback(() => {
    if (hasNext && !loading) {
      onNext();
    }
  }, [hasNext, loading, onNext]);

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, !hasPrevious && styles.disabledButton]}
        onPress={handlePrevious}
        disabled={!hasPrevious || loading}
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
          {totalItems} total results
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.paginationButton, !hasNext && styles.disabledButton]}
        onPress={handleNext}
        disabled={!hasNext || loading}
      >
        <Text style={[styles.paginationButtonText, !hasNext && styles.disabledButtonText]}>
          Next →
        </Text>
      </TouchableOpacity>
    </View>
  );
});

/**
 * Memoized Loading Component
 */
export const LoadingSpinner = React.memo(({ message = 'Loading...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.accent} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
));

/**
 * Memoized Error Component
 */
export const ErrorMessage = React.memo(({ message, onRetry }) => {
  const handleRetry = React.useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>Error</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  // Record Card Styles
  resultCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.base,
    marginBottom: spacing.base,
    padding: spacing.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },

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

  label: {
    fontSize: typography.fontSize.xs,
    color: colors.accent,
    marginBottom: spacing.xs,
    opacity: 0.9,
  },

  country: {
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

  // Pagination Styles
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

  // Loading Styles
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

  // Error Styles
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
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
    minWidth: 120,
  },

  retryButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },
});

export default {
  RecordCard,
  PaginationControls,
  LoadingSpinner,
  ErrorMessage,
};