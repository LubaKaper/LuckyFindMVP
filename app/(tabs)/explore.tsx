import React from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import sophisticatedTheme from '@/styles/sophisticatedTheme';

const { width } = Dimensions.get('window');
const { colors, spacing, typography, shadows, borderRadius } = sophisticatedTheme;

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Vinyl</Text>
        <Text style={styles.headerSubtitle}>
          Explore the world of vinyl records and discover your next favorite find
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {genres.map((genre, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  <Ionicons name="disc" size={24} color={colors.accent} />
                </View>
                <Text style={styles.categoryText}>{genre.name}</Text>
                <Text style={styles.categoryCount}>{genre.count} records</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <View key={index} style={styles.actionCard}>
                <Ionicons
                  name={action.icon as any}
                  size={28}
                  color={colors.accent}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          <View style={styles.tipsContainer}>
            {proTips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="bulb" size={16} color={colors.accent} />
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                </View>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const genres = [
  { name: 'Jazz', count: 1250 },
  { name: 'Rock', count: 2100 },
  { name: 'Electronic', count: 890 },
  { name: 'Classical', count: 650 },
];

const quickActions = [
  {
    icon: 'search-outline',
    title: 'Smart Search',
    description: 'Use advanced filters to find records',
  },
  {
    icon: 'heart-outline',
    title: 'Wishlist',
    description: 'Save records for later',
  },
  {
    icon: 'analytics-outline',
    title: 'Market Trends',
    description: 'Track price changes',
  },
  {
    icon: 'library-outline',
    title: 'Collection',
    description: 'Manage your vinyl',
  },
];

const proTips = [
  {
    title: 'Check Condition',
    description: 'Always examine record grading before purchasing.',
  },
  {
    title: 'Research Prices',
    description: 'Compare prices across platforms for fair deals.',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.8,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  horizontalScroll: {
    marginLeft: -spacing.lg,
  },
  categoryCard: {
    width: 120,
    marginLeft: spacing.lg,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    ...shadows.md,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - spacing.lg * 3) / 2,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  tipsContainer: {
    gap: spacing.sm,
  },
  tipCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  tipDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
