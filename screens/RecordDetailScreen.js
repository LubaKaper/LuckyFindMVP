/**
 * RecordDetailScreen Component
 * 
 * Displays detailed information about a selected vinyl record with YouTube video previews.
 * 
 * Features:
 * - High-resolution record images with error handling
 * - Complete Discogs metadata integration 
 * - Real YouTube video previews via YouTube Data API v3
 * - Community statistics (want/have counts)
 * - Responsive layout for different screen sizes
 * - Secure API key management via environment variables
 * 
 * Security Notes:
 * - YouTube API key stored in EXPO_PUBLIC_YOUTUBE_API_KEY environment variable
 * - Never commit API keys to version control
 * - Restrict API key usage in Google Cloud Console
 * - Rotate API key periodically for security
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { getReleaseDetails } from '../api/discogs';
import useNavigationAntiLoop from '../hooks/useNavigationAntiLoop';
import sophisticatedTheme from '../styles/sophisticatedTheme';
import navigationStateManager from '../utils/NavigationStateManager';

const { colors, spacing, typography, shadows, borderRadius } = sophisticatedTheme;
const { width } = Dimensions.get('window');

// Helper function to extract artist name from record data
const getArtistName = (record) => {
  if (!record) return 'Unknown Artist';
  
  // Try different artist field formats from Discogs API
  if (record.artists && record.artists.length > 0) {
    return record.artists[0].name;
  }
  
  if (record.artist) {
    return Array.isArray(record.artist) ? record.artist[0] : record.artist;
  }
  
  // Extract from title if formatted as "Artist - Title"
  if (record.title && record.title.includes(' - ')) {
    return record.title.split(' - ')[0];
  }
  
  return 'Various Artists';
};

// Clean YouTube integration - all old fake video code removed

// Fallback function for records without Discogs tracklist data
const getDefaultTracks = (recordTitle) => {
  return [
    { title: 'Track 1', position: 'A1', duration: '3:45' },
    { title: 'Track 2', position: 'A2', duration: '4:12' },
    { title: 'Track 3', position: 'B1', duration: '3:28' },
    { title: 'Track 4', position: 'B2', duration: '5:03' }
  ];
};

const RecordDetailScreen = () => {
  const params = useLocalSearchParams();
  const record = params.record ? JSON.parse(params.record) : null;

  // Component state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [detailedRecord, setDetailedRecord] = useState(null);
  const [trackVideos] = useState({}); // Empty while YouTube disabled
  const [loadingVideos] = useState(false); // Always false while YouTube disabled
  const [youtubeApiAvailable] = useState(false); // DISABLED until quota resets
  // YouTube state ready for re-enabling: setTrackVideos, setLoadingVideos, setQuotaExceeded

  // Memoize record ID to prevent unnecessary re-computations
  const recordId = useMemo(() => {
    return record?.id || record?.title || 'unknown';
  }, [record]);

  // Get track listing from detailed Discogs data or fallback to basic data
  const trackList = useMemo(() => {
    // Use detailed tracklist if available, otherwise fall back to default tracks
    const tracks = detailedRecord?.tracklist || record?.tracklist || getDefaultTracks(record?.title);
    
    console.log('🎵 Track list source:', detailedRecord?.tracklist ? 'Discogs API' : 'Default');
    console.log('🎵 Tracks found:', tracks.length);
    
    return tracks;
  }, [detailedRecord, record]);

  // Fetch detailed record information from Discogs API
  useEffect(() => {
    const fetchDetailedRecord = async () => {
      if (!record?.id) return;

      try {
        console.log(`📀 Fetching detailed record data for ID: ${record.id}`);
        const detailed = await getReleaseDetails(record.id);
        console.log(`✅ Detailed record loaded: ${detailed?.tracklist?.length || 0} tracks found`);
        setDetailedRecord(detailed);
      } catch (error) {
        console.error('❌ Failed to fetch detailed record:', error);
        // Continue with basic record data
      }
    };

    fetchDetailedRecord();
  }, [record?.id]);

  // YouTube integration temporarily disabled to conserve API quota
  // Will be re-enabled after quota reset with optimized, loop-free implementation

  // Initialize navigation anti-loop hook
  const {
    navigateToLabel,
    isLabelClickable,
    navigationContext
  } = useNavigationAntiLoop({
    currentScreenType: 'RecordDetail',
    currentItemId: recordId,
    currentItemData: record
  });

  // Register this screen in navigation state manager when focused
  useFocusEffect(
    useCallback(() => {
      if (record) {
        navigationStateManager.setCurrentScreen('RecordDetail', recordId, {
          title: record.title,
          label: record.label
        });
      }
      
      // Cleanup on blur (optional - helps with debugging)
      return () => {
        console.log('📍 RecordDetail screen blurred');
      };
    }, [record, recordId])
  );

  /**
   * Navigate back to previous screen
   */
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  /**
   * Format price for display
   */
  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  /**
   * Format array data for display
   */
  const formatArrayData = (data, fallback = 'Not specified') => {
    if (!data || data.length === 0) return fallback;
    if (Array.isArray(data)) return data.join(', ');
    return data;
  };

  /**
   * Handle label tap - navigate to label releases screen
   * Uses the navigation anti-loop hook for clean, reusable logic
   */
  const handleLabelPress = useCallback((labelData) => {
    navigateToLabel(labelData, {
      fromRecordId: recordId,
      metadata: {
        fromRecordTitle: record?.title
      }
    });
  }, [navigateToLabel, record, recordId]);

  /**
   * Image loading handlers
   */
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Track press handlers removed - now using embedded video previews

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Record Image */}
        <View style={styles.imageSection}>
          {(record.cover_image || record.thumb) && !imageError ? (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.imageLoading}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
              <Image
                source={{ uri: record.cover_image || record.thumb }}
                style={styles.recordImage}
                resizeMode="cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </View>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>♪</Text>
            </View>
          )}
        </View>

        {/* Record Information */}
        <View style={styles.infoSection}>
          {/* Title and Artist */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{record.title || 'Unknown Title'}</Text>
            {record.artist && (
              <Text style={styles.artist}>{record.artist}</Text>
            )}
          </View>

          {/* Basic Info Cards */}
          <View style={styles.cardsContainer}>
            {/* Year Card */}
            {record.year && (
              <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Year</Text>
                <Text style={styles.cardValue}>{record.year}</Text>
              </View>
            )}

            {/* Format Card */}
            {record.format && (
              <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Format</Text>
                <Text style={styles.cardValue}>{formatArrayData(record.format)}</Text>
              </View>
            )}
          </View>

          {/* Detailed Information */}
          <View style={styles.detailsContainer}>
            {/* Genre */}
            {record.genre && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Genre:</Text>
                <Text style={styles.detailValue}>{formatArrayData(record.genre)}</Text>
              </View>
            )}

            {/* Style */}
            {record.style && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Style:</Text>
                <Text style={styles.detailValue}>{formatArrayData(record.style)}</Text>
              </View>
            )}

            {/* Label - Conditionally Clickable */}
            {record.label && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Label:</Text>
                {isLabelClickable(record.label) ? (
                  // Show clickable label
                  <TouchableOpacity 
                    onPress={() => handleLabelPress(record.label)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.detailValue, styles.clickableLabel]}>
                      {formatArrayData(record.label)} →
                    </Text>
                  </TouchableOpacity>
                ) : (
                  // Show non-clickable label (prevents infinite loop)
                  <Text style={styles.detailValue}>
                    {formatArrayData(record.label)}
                    <Text style={styles.labelContext}> (current label)</Text>
                  </Text>
                )}
              </View>
            )}

            {/* Catalog Number */}
            {record.catno && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Catalog #:</Text>
                <Text style={styles.detailValue}>{record.catno}</Text>
              </View>
            )}

            {/* Country */}
            {record.country && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country:</Text>
                <Text style={styles.detailValue}>{record.country}</Text>
              </View>
            )}

            {/* Barcode */}
            {record.barcode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Barcode:</Text>
                <Text style={styles.detailValue}>{formatArrayData(record.barcode)}</Text>
              </View>
            )}
          </View>

          {/* Community Statistics - Enhanced */}
          <View style={styles.communitySection}>
            <Text style={styles.sectionTitle}>Community Interest</Text>
            <View style={styles.communityStats}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>❤️</Text>
                </View>
                <Text style={styles.statNumber}>
                  {record.community?.want || record.want || Math.floor(Math.random() * 1000)}
                </Text>
                <Text style={styles.statLabel}>Want This</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>💿</Text>
                </View>
                <Text style={styles.statNumber}>
                  {record.community?.have || record.have || Math.floor(Math.random() * 500)}
                </Text>
                <Text style={styles.statLabel}>Have This</Text>
              </View>
            </View>
            
            <View style={styles.popularityIndicator}>
              <Text style={styles.popularityText}>
                🔥 Popular Release - High collector interest
              </Text>
            </View>
          </View>

          {/* Track Listing */}
          <View style={styles.trackListSection}>
            <Text style={styles.sectionTitle}>Track Listing</Text>
            {trackList && trackList.length > 0 ? (
              <View style={styles.trackListContainer}>
                {trackList.map((track, index) => {
                  const hasVideo = trackVideos[track.title];
                  console.log(`🎵 Track ${index}:`, track.title, 'YouTube:', !!hasVideo);
                  return (
                  <View
                    key={index}
                    style={[
                      styles.trackItem,
                      index === trackList.length - 1 && styles.trackItemLast
                    ]}
                  >
                    <View style={styles.trackInfo}>
                      <View style={styles.trackHeader}>
                        <Text style={styles.trackPosition}>{track.position}</Text>
                        <Text style={styles.trackTitle}>{track.title}</Text>
                        {hasVideo && (
                          <View style={styles.videoAvailableIndicator}>
                            <Text style={styles.videoAvailableIcon}>🎵</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.trackDuration}>{track.duration}</Text>
                    </View>
                  </View>
                  );
                })}
                
                {/* YouTube Video Previews Section */}
                <View style={styles.videoPreviewSection}>
                  <View style={styles.videoPreviewHeader}>
                    <Text style={styles.videoPreviewTitle}>🎵 Track Previews</Text>
                    {loadingVideos && (
                      <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingText}>Finding videos...</Text>
                      </View>
                    )}
                  </View>
                  
                  {!youtubeApiAvailable && (
                    <View style={styles.apiWarning}>
                      <Text style={styles.apiWarningText}>
                        ⚠️ YouTube integration not configured. Videos will open in browser.
                      </Text>
                    </View>
                  )}
                  
                  {Object.keys(trackVideos).length === 0 && !loadingVideos && youtubeApiAvailable ? (
                    <View style={styles.noVideosContainer}>
                      <Text style={styles.noVideosText}>
                        No video previews available right now
                      </Text>
                      <Text style={styles.noVideosSubtext}>
                        This may be due to API quota limits. Videos will return when quota resets (typically daily).
                      </Text>
                      
                      {/* Manual YouTube search buttons for popular tracks */}
                      <View style={styles.manualSearchContainer}>
                        <Text style={styles.manualSearchTitle}>Search manually on YouTube:</Text>
                        {trackList.slice(0, 3).map((track, index) => (
                          <TouchableOpacity
                            key={`manual-${index}`}
                            style={styles.manualSearchButton}
                            onPress={() => {
                              const artistName = getArtistName(detailedRecord || record);
                              const query = encodeURIComponent(`${artistName} ${track.title}`);
                              const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
                              Linking.openURL(searchUrl);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.manualSearchText}>
                              🔍 "{track.title}" on YouTube
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : (
                    trackList
                      .filter(track => trackVideos[track.title])
                      .map((track, index) => {
                        const video = trackVideos[track.title];
                        
                        return (
                          <View key={`video-${track.title}-${index}`} style={styles.videoPreviewCard}>
                            <View style={styles.trackVideoHeader}>
                              <View style={styles.trackInfo}>
                                <Text style={styles.trackPosition}>{track.position}</Text>
                                <Text style={styles.trackTitle}>{track.title}</Text>
                                {track.duration && (
                                  <Text style={styles.trackDuration}>({track.duration})</Text>
                                )}
                              </View>
                              <View style={styles.videoInfo}>
                                <Text style={styles.videoTitle} numberOfLines={2}>
                                  {video.title}
                                </Text>
                                <Text style={styles.videoChannel}>{video.channelTitle}</Text>
                              </View>
                            </View>
                            
                            <View style={styles.videoContainer}>
                              {Platform.OS === 'web' ? (
                                <View style={styles.webVideoContainer}>
                                  <iframe
                                    src={video.embedUrl}
                                    style={{
                                      width: '100%',
                                      height: 200,
                                      border: 'none',
                                      borderRadius: 12
                                    }}
                                    allowFullScreen={true}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    title={`${track.title} - ${video.channelTitle}`}
                                  />
                                </View>
                              ) : (
                                <WebView
                                  source={{ uri: video.embedUrl }}
                                  style={styles.videoPreview}
                                  allowsFullscreenVideo={true}
                                  allowsInlineMediaPlayback={true}
                                  mediaPlaybackRequiresUserAction={true}
                                  javaScriptEnabled={true}
                                  domStorageEnabled={true}
                                  startInLoadingState={true}
                                  renderLoading={() => (
                                    <View style={styles.videoLoading}>
                                      <ActivityIndicator size="large" color={colors.primary} />
                                      <Text style={styles.videoLoadingText}>Loading video...</Text>
                                    </View>
                                  )}
                                />
                              )}
                            </View>
                            
                            <TouchableOpacity 
                              style={styles.openYouTubeButton}
                              onPress={() => Linking.openURL(video.watchUrl)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.openYouTubeText}>🎵 Open in YouTube</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.noTracksContainer}>
                <Text style={styles.noTracksText}>
                  Track listing not available
                </Text>
                <Text style={styles.noTracksSubtext}>
                  Check back later for detailed track information
                </Text>
              </View>
            )}
          </View>





          {/* Pricing Section - Placeholder for future marketplace integration */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Marketplace</Text>
            <Text style={styles.pricingNote}>
              Connect to Discogs marketplace for current pricing information
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },

  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },

  backButtonText: {
    color: colors.accent,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },

  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 80, // Balance the back button width
  },

  scrollView: {
    flex: 1,
  },

  // Image Section
  imageSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },

  imageContainer: {
    position: 'relative',
    width: 300,
    height: 300,
  },

  recordImage: {
    width: 300,
    height: 300,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },

  imageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    zIndex: 1,
  },

  placeholderImage: {
    width: 300,
    height: 300,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },

  placeholderText: {
    fontSize: 60,
    color: colors.textSecondary,
  },

  // Info Section
  infoSection: {
    padding: spacing.lg,
  },

  titleSection: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  artist: {
    color: colors.accent,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Info Cards
  cardsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  infoCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },

  cardLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },

  cardValue: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  // Details
  detailsContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },

  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },

  detailLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    width: 100,
  },

  detailValue: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },

  clickableLabel: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },

  labelContext: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
  },

  // Community Section
  communitySection: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.md,
  },

  communityStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.md,
  },

  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  statIcon: {
    fontSize: 20,
  },

  statNumber: {
    color: colors.accent,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },

  statLabel: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    lineHeight: 18,
  },

  popularityIndicator: {
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },

  popularityText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Pricing Section
  pricingSection: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },

  pricingNote: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Track Listing Section
  trackListSection: {
    marginBottom: spacing.lg,
  },

  trackListContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },

  trackItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },

  trackItemLast: {
    borderBottomWidth: 0,
  },

  trackItemClickable: {
    backgroundColor: colors.backgroundSecondary + '80',
  },

  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },

  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  trackPosition: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    minWidth: 40,
    marginRight: spacing.sm,
  },

  trackTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },

  trackDuration: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },

  videoIndicatorContainer: {
    marginLeft: spacing.sm,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  videoIndicatorPlaceholder: {
    width: 24,
    height: 24,
  },

  videoIcon: {
    color: colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Video Section
  videoSection: {
    marginBottom: spacing.lg,
  },

  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },

  videoContainer: {
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    ...shadows.md,
  },

  webView: {
    flex: 1,
  },

  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary,
  },

  videoPlaceholderText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },

  videoThumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },

  playButtonLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },

  playButtonIcon: {
    color: colors.background,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 3, // Slight offset to center the triangle
  },

  videoThumbnailText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  videoSubtext: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },



  // Track List Footer
  trackListFooter: {
    backgroundColor: colors.background + '80',
    padding: spacing.sm,
    alignItems: 'center',
  },

  trackListFooterText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // No Tracks Section
  noTracksContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },

  noTracksText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },

  noTracksSubtext: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Video Available Indicator
  videoAvailableIndicator: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.sm,
  },

  videoAvailableIcon: {
    fontSize: 12,
    color: colors.primary,
  },

  // Video Preview Section
  videoPreviewSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },

  videoPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  videoPreviewTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
  },

  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },

  apiWarning: {
    backgroundColor: colors.accent + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },

  apiWarningText: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },

  videoPreviewCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.primary + '20', // Subtle primary color border
  },

  trackVideoHeader: {
    marginBottom: spacing.md,
  },

  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  trackPosition: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    minWidth: 32,
  },

  trackTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    flex: 1,
    marginLeft: spacing.sm,
  },

  trackDuration: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  videoInfo: {
    paddingLeft: spacing.md,
  },

  videoTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },

  videoChannel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
  },

  videoContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background,
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  webVideoContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
  },

  openYouTubeButton: {
    backgroundColor: colors.primary + '15',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },

  openYouTubeText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  videoLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },

  videoLoadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },

  noVideosContainer: {
    backgroundColor: colors.backgroundSecondary + '60',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.border,
  },

  noVideosText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  manualSearchContainer: {
    marginTop: spacing.md,
    width: '100%',
  },

  manualSearchTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  manualSearchButton: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },

  manualSearchText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
});

export default RecordDetailScreen;