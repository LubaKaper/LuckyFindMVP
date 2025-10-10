/**
 * LabelReleasesScreen Component
 * 
 * Displays all releases from a specific record label in a scrollable list.
 * Users can tap on any release to view its detailed information.
 * 
 * Features:
 * - Paginated list of label releases
 * - Infinite scroll/load more functionality
 * - Grid layout similar to search results
 * - Navigation to individual record details
 * - Loading states and error handling
 * - Pull-to-refresh functionality
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLabelReleases } from '../api/discogs';
import { useApiRequest } from '../hooks/useApiRequest';
import useNavigationAntiLoop from '../hooks/useNavigationAntiLoop';
import { borderRadius, colors, shadows, spacing, typography } from '../styles/theme';
import apiRequestManager from '../utils/APIRequestManager';
import navigationStateManager from '../utils/NavigationStateManager';

const LabelReleasesScreen = () => {
  const params = useLocalSearchParams();
  const labelName = params.labelName || '';
  const fromRecordId = params.fromRecordId || null; // Context from previous screen
  
  // State management
  const [releases, setReleases] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Custom hook for API requests with cleanup
  const { executeRequest, cancelRequest } = useApiRequest();

  // Refs for preventing duplicate requests and managing component state
  const lastLoadedPage = useRef(0);
  const lastLoadedLabelName = useRef('');
  const isComponentMounted = useRef(true);

  // Memoize label name to prevent unnecessary re-renders
  const normalizedLabelName = useMemo(() => labelName.trim(), [labelName]);

  // Initialize navigation anti-loop hook
  const {
    navigateToRecord,
    isRecordClickable,
    navigationContext
  } = useNavigationAntiLoop({
    currentScreenType: 'LabelReleases',
    currentItemId: normalizedLabelName,
    currentItemData: { labelName: normalizedLabelName }
  });

  // Register this screen in navigation state manager when focused
  useFocusEffect(
    useCallback(() => {
      if (normalizedLabelName) {
        navigationStateManager.setCurrentScreen('LabelReleases', normalizedLabelName, {
          totalReleases: pagination.totalItems,
          fromRecordId: fromRecordId
        });
      }
      
      return () => {
        console.log('📍 LabelReleases screen blurred');
        // Cancel any pending requests when screen loses focus
        apiRequestManager.cancelRequest('getLabelReleases', { 
          labelName: normalizedLabelName 
        });
      };
    }, [normalizedLabelName, pagination.totalItems, fromRecordId])
  );

  // Cleanup on unmount
  useEffect(() => {
    isComponentMounted.current = true;
    
    return () => {
      isComponentMounted.current = false;
      cancelRequest();
      apiRequestManager.cancelRequest('getLabelReleases', { 
        labelName: normalizedLabelName 
      });
    };
  }, [normalizedLabelName, cancelRequest]);

  /**
   * Load releases for the current page with duplicate request prevention
   */
  const loadReleases = useCallback(async (page = 1, append = false, forceRefresh = false) => {
    // Prevent duplicate requests for same page and label
    const isSamePage = page === lastLoadedPage.current;
    const isSameLabel = normalizedLabelName === lastLoadedLabelName.current;
    
    if (!forceRefresh && isSamePage && isSameLabel && !append) {
      console.log(`🚫 Skipping duplicate request for ${normalizedLabelName}, page ${page}`);
      return;
    }
    
    if (isLoading || isLoadingMore) {
      console.log('🚫 Request already in progress, skipping');
      return;
    }
    
    if (!append) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Use API request manager for deduplication and caching
      const result = await apiRequestManager.executeRequest(
        'getLabelReleases',
        { 
          labelName: normalizedLabelName, 
          page, 
          perPage: 50 
        },
        async (signal) => {
          return await executeRequest(
            async () => await getLabelReleases(normalizedLabelName, page, 50)
          );
        },
        {
          useCache: !forceRefresh,
          cacheTTL: 3 * 60 * 1000, // 3 minutes cache for label releases
          forceRefresh: forceRefresh
        }
      );

      // Only update state if component is still mounted
      if (isComponentMounted.current && result) {
        const newReleases = result.results || [];
        
        setReleases(prev => append ? [...prev, ...newReleases] : newReleases);
        
        setPagination({
          currentPage: page,
          totalPages: result.pagination?.pages || 1,
          totalItems: result.pagination?.items || 0,
          hasNextPage: page < (result.pagination?.pages || 1),
        });
        
        // Update refs to prevent duplicates
        lastLoadedPage.current = page;
        lastLoadedLabelName.current = normalizedLabelName;
      }
    } catch (err) {
      if (isComponentMounted.current && err.name !== 'AbortError') {
        console.error('❌ Failed to load label releases:', err.message);
        
        // Provide user-friendly error messages
        let userMessage = err.message;
        if (err.message.includes('Rate limit') || err.message.includes('429')) {
          userMessage = 'API rate limit reached. Please wait a moment and try again.';
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          userMessage = 'Network connection issue. Please check your internet connection.';
        } else if (err.message.includes('Authentication') || err.message.includes('401')) {
          userMessage = 'Authentication issue. Please try again later.';
        }
        
        setError(userMessage);
      }
    } finally {
      if (isComponentMounted.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    }
  }, [normalizedLabelName, isLoading, isLoadingMore, executeRequest]);

  /**
   * Load initial releases on component mount or when label changes
   */
  useEffect(() => {
    if (normalizedLabelName && normalizedLabelName !== lastLoadedLabelName.current) {
      console.log(`🏷️ Loading releases for new label: ${normalizedLabelName}`);
      // Reset state for new label
      setReleases([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
      });
      lastLoadedPage.current = 0;
      
      loadReleases(1, false, false);
    }
  }, [normalizedLabelName, loadReleases]);

  /**
   * Handle pull-to-refresh with force refresh
   */
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing label releases');
    setIsRefreshing(true);
    lastLoadedPage.current = 0; // Reset to allow refresh
    loadReleases(1, false, true); // Force refresh
  }, [loadReleases]);

  /**
   * Handle load more (infinite scroll) with duplicate prevention
   */
  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !isLoading && !isLoadingMore) {
      const nextPage = pagination.currentPage + 1;
      console.log(`📄 Loading more releases, page ${nextPage}`);
      loadReleases(nextPage, true, false);
    }
  }, [pagination.hasNextPage, pagination.currentPage, isLoading, isLoadingMore, loadReleases]);

  /**
   * Navigate back to previous screen
   */
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  /**
   * Navigate to record detail screen with anti-loop protection
   * Uses the navigation anti-loop hook for clean, reusable logic
   */
  const handleRecordPress = useCallback((record) => {
    navigateToRecord(record, {
      fromLabelName: normalizedLabelName,
      metadata: {
        fromLabelReleasesScreen: true
      }
    });
  }, [navigateToRecord, normalizedLabelName]);

  /**
   * Render individual release item
   */
  const renderReleaseItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.releaseCard}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.8}
    >
      {/* Album Art */}
      <View style={styles.imageContainer}>
        {(item.imageUrl || item.thumb) ? (
          <Image
            source={{ uri: item.imageUrl || item.thumb }}
            style={styles.albumImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>♪</Text>
          </View>
        )}
      </View>
      
      {/* Release Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {Array.isArray(item.title) ? item.title.join(', ') : String(item.title || 'Unknown Title')}
        </Text>
        
        {item.artist && (
          <Text style={styles.artist} numberOfLines={1}>
            {Array.isArray(item.artist) ? item.artist.join(', ') : String(item.artist)}
          </Text>
        )}
        
        {item.year && (
          <Text style={styles.year}>{String(item.year)}</Text>
        )}
        
        {item.country && (
          <Text style={styles.country} numberOfLines={1}>
            🌍 {String(item.country)}
          </Text>
        )}
        
        {((item.genres && item.genres.length > 0) || item.genre) && (
          <View style={styles.genreContainer}>
            <Text style={styles.genreText} numberOfLines={1}>
              {(() => {
                if (item.genres && item.genres.length > 0) {
                  return Array.isArray(item.genres) ? item.genres[0] : String(item.genres);
                } else if (item.genre) {
                  if (typeof item.genre === 'string') {
                    return item.genre.split(',')[0];
                  } else if (Array.isArray(item.genre)) {
                    return String(item.genre[0] || '');
                  } else {
                    return String(item.genre);
                  }
                }
                return '';
              })()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [handleRecordPress]);

  /**
   * Render loading footer for infinite scroll
   */
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.loadingFooterText}>Loading more...</Text>
      </View>
    );
  }, [isLoadingMore]);

  /**
   * Render empty state
   */
  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏷️</Text>
      <Text style={styles.emptyText}>No Releases Found</Text>
      <Text style={styles.emptyMessage}>
        This label doesn't have any releases in the database.
      </Text>
    </View>
  ), []);

  /**
   * Render error state
   */
  const renderError = useCallback(() => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>Error Loading Releases</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => loadReleases(1, false)}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  ), [error, loadReleases]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {labelName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {pagination.totalItems} releases
          </Text>
        </View>
      </View>

      {/* Content */}
      {error ? (
        renderError()
      ) : (
        <FlatList
          data={releases}
          renderItem={renderReleaseItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            releases.length === 0 && !isLoading && styles.flexContent
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={!isLoading ? renderEmpty : null}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />
      )}

      {/* Loading Overlay for Initial Load */}
      {isLoading && releases.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading releases...</Text>
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
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
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

  headerContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  headerTitle: {
    color: colors.textAccent,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // List
  listContent: {
    padding: spacing.base,
  },

  flexContent: {
    flex: 1,
  },

  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },

  // Release Cards
  releaseCard: {
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

  // Loading States
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    marginTop: spacing.md,
  },

  loadingFooter: {
    padding: spacing.lg,
    alignItems: 'center',
  },

  loadingFooterText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Empty State
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

  // Error State
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
  },

  retryButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },
});

export default LabelReleasesScreen;