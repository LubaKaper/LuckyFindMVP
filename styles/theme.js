/**
 * Theme configuration file containing shared colors, fonts, and spacing variables.
 * This file centralizes all design tokens to maintain consistency across the app.
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palette for the app
export const colors = {
  // Primary colors
  primary: '#DFFF00', // Chartreuse - used for accents, buttons, highlights
  accent: '#DFFF00', // Chartreuse - accent color alias
  background: '#000000', // Pure black - main background
  
  // Secondary colors
  backgroundSecondary: '#1a1a1a', // Dark gray - for cards, inputs
  backgroundTertiary: '#2a2a2a', // Lighter gray - for dropdown content
  
  // Text colors
  text: '#FFFFFF', // White - primary text
  textSecondary: '#666666', // Gray - secondary text, placeholders
  textAccent: '#DFFF00', // Chartreuse - accent text, labels
  
  // Interactive states
  border: '#DFFF00', // Chartreuse - borders, outlines
  borderSecondary: '#333333', // Dark gray - subtle borders
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Typography scale
export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing system based on 4px grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
};

// Border radius values
export const borderRadius = {
  sm: 4,
  base: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  full: 9999,
};

// Shadow configurations
export const shadows = {
  sm: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
};

// Animation durations (in milliseconds)
export const animations = {
  fast: 150,
  base: 300,
  slow: 500,
};

// Layout dimensions
export const layout = {
  window: {
    width,
    height,
  },
  // Common component sizes
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 60,
  tabBarHeight: 80,
};

// Common component styles that can be reused
export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Text styles
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textAccent,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textAccent,
  },
  
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textAccent,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.backgroundSecondary,
    color: colors.text,
    fontSize: typography.fontSize.base,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.base,
  },
  
  buttonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  layout,
  commonStyles,
};