/**
 * RecordDetailScreen Component
 * 
 * Displays detailed information about a selected vinyl record.
 * Shows high-resolution images, complete metadata, and pricing information.
 * 
 * Features:
 * - Full-screen record image
 * - Complete record metadata
 * - Community statistics (want/have counts)
 * - Smooth navigation back to results
 * - Responsive layout for different screen sizes
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useNavigationAntiLoop from '../hooks/useNavigationAntiLoop';
import { borderRadius, colors, shadows, spacing, typography } from '../styles/theme';
import navigationStateManager from '../utils/NavigationStateManager';

const RecordDetailScreen = () => {
  const params = useLocalSearchParams();
  const record = params.record ? JSON.parse(params.record) : null;

  // Memoize record ID to prevent unnecessary re-computations
  const recordId = useMemo(() => {
    return record?.id || record?.title || 'unknown';
  }, [record]);

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
          {record.cover_image ? (
            <Image
              source={{ uri: record.cover_image }}
              style={styles.recordImage}
              resizeMode="cover"
            />
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

          {/* Community Statistics */}
          {record.community && (
            <View style={styles.communitySection}>
              <Text style={styles.sectionTitle}>Community</Text>
              <View style={styles.communityStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{record.community.want || 0}</Text>
                  <Text style={styles.statLabel}>Want</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{record.community.have || 0}</Text>
                  <Text style={styles.statLabel}>Have</Text>
                </View>
              </View>
            </View>
          )}

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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },

  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.base,
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

  recordImage: {
    width: 300,
    height: 300,
    borderRadius: borderRadius.lg,
    ...shadows.md,
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
    padding: spacing.base,
    borderRadius: borderRadius.base,
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
    borderRadius: borderRadius.base,
    padding: spacing.base,
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
    padding: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    ...shadows.sm,
  },

  statNumber: {
    color: colors.accent,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Pricing Section
  pricingSection: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    ...shadows.sm,
  },

  pricingNote: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default RecordDetailScreen;