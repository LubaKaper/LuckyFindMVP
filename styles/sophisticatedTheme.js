/**
 * Sophisticated Color Palette Theme
 * 
 * Navy and coral palette inspired by Tailwind CSS utility classes
 * - Background: navy (bg-blue-900)
 * - Primary text: light blue (text-blue-300)
 * - Secondary text: gray-blue (text-blue-400)
 * - Accent: coral pink (pink-400/rose-400)
 */

export const sophisticatedColors = {
  // Background colors (Navy palette)
  background: '#1e3a8a', // bg-blue-900
  backgroundSecondary: '#1e40af', // bg-blue-800
  backgroundTertiary: '#2563eb', // bg-blue-700
  
  // Card and surface colors
  surface: '#1e40af', // bg-blue-800
  surfaceElevated: '#2563eb', // bg-blue-700
  
  // Text colors (Light blue palette)
  text: '#93c5fd', // text-blue-300
  textSecondary: '#60a5fa', // text-blue-400
  textTertiary: '#3b82f6', // text-blue-500
  
  // Accent colors (Coral pink palette)
  accent: '#f472b6', // pink-400
  accentHover: '#ec4899', // pink-500
  accentPressed: '#db2777', // pink-600
  
  // Alternative accent (Rose palette)
  accentAlt: '#fb7185', // rose-400
  accentAltHover: '#f43f5e', // rose-500
  
  // Status colors
  success: '#22c55e', // green-500
  error: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  
  // Border colors
  border: '#3b82f6', // blue-500
  borderLight: '#60a5fa', // blue-400
  borderDark: '#2563eb', // blue-700
  
  // Shadow colors
  shadow: 'rgba(30, 58, 138, 0.4)', // blue-900 with opacity
  shadowLight: 'rgba(59, 130, 246, 0.2)', // blue-500 with opacity
};

// Spacing system (Tailwind-inspired)
export const spacing = {
  xs: 4,   // p-1
  sm: 8,   // p-2
  md: 16,  // p-4
  lg: 24,  // p-6
  xl: 32,  // p-8
  xxl: 48, // p-12
  xxxl: 64, // p-16
};

// Typography system (Tailwind-inspired)
export const typography = {
  fontSize: {
    xs: 12,    // text-xs
    sm: 14,    // text-sm
    base: 16,  // text-base
    lg: 18,    // text-lg
    xl: 20,    // text-xl
    '2xl': 24, // text-2xl
    '3xl': 30, // text-3xl
  },
  fontWeight: {
    normal: '400',    // font-normal
    medium: '500',    // font-medium
    semibold: '600',  // font-semibold
    bold: '700',      // font-bold
  },
  lineHeight: {
    tight: 1.25,   // leading-tight
    normal: 1.5,    // leading-normal
    relaxed: 1.625, // leading-relaxed
  }
};

// Border radius system (Tailwind-inspired)
export const borderRadius = {
  none: 0,
  sm: 4,   // rounded-sm
  md: 8,   // rounded
  lg: 12,  // rounded-lg
  xl: 16,  // rounded-xl
  full: 999, // rounded-full
};

// Shadow system (Tailwind-inspired)
export const shadows = {
  sm: {
    shadowColor: sophisticatedColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: sophisticatedColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: sophisticatedColors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 5,
  }
};

// Button styles (Tailwind-inspired)
export const buttonStyles = {
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: sophisticatedColors.accent,
  },
  primaryHover: {
    backgroundColor: sophisticatedColors.accentHover,
  },
  secondary: {
    backgroundColor: sophisticatedColors.surface,
    borderWidth: 1,
    borderColor: sophisticatedColors.border,
  },
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: sophisticatedColors.background,
  },
  textSecondary: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: sophisticatedColors.text,
  }
};

// Input styles (Tailwind-inspired)
export const inputStyles = {
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: sophisticatedColors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: sophisticatedColors.surface,
    borderWidth: 1,
    borderColor: sophisticatedColors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: sophisticatedColors.text,
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: sophisticatedColors.accent,
    ...shadows.md,
  }
};

// Card styles (Tailwind-inspired)
export const cardStyles = {
  base: {
    backgroundColor: sophisticatedColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  elevated: {
    backgroundColor: sophisticatedColors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
  }
};

export default {
  colors: sophisticatedColors,
  spacing,
  typography,
  borderRadius,
  shadows,
  buttonStyles,
  inputStyles,
  cardStyles,
};