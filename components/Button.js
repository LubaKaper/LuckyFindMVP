/**
 * Button Component
 * 
 * A reusable button component with various styles, sizes, and interaction states.
 * Supports different variants, loading states, and custom styling.
 * 
 * Props:
 * - title: Button text
 * - onPress: Press handler function
 * - variant: Button style variant ('primary', 'secondary', 'outline', 'ghost')
 * - size: Button size ('small', 'medium', 'large')
 * - disabled: Disable button interaction
 * - loading: Show loading indicator
 * - icon: Optional icon component
 * - iconPosition: Icon position ('left', 'right')
 * - style: Custom style object
 * - textStyle: Custom text style object
 * - children: Optional children to render instead of title
 */

import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../styles/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style = {},
  textStyle = {},
  children,
  ...otherProps
}) => {
  // Animation value for press feedback
  const [scaleValue] = useState(new Animated.Value(1));
  
  /**
   * Handle press in animation
   */
  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  
  /**
   * Handle press out animation
   */
  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  
  /**
   * Get button container styles based on variant and size
   */
  const getButtonStyles = () => {
    let buttonStyles = [styles.button];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        buttonStyles.push(styles.buttonPrimary);
        break;
      case 'secondary':
        buttonStyles.push(styles.buttonSecondary);
        break;
      case 'outline':
        buttonStyles.push(styles.buttonOutline);
        break;
      case 'ghost':
        buttonStyles.push(styles.buttonGhost);
        break;
      default:
        buttonStyles.push(styles.buttonPrimary);
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        buttonStyles.push(styles.buttonSmall);
        break;
      case 'medium':
        buttonStyles.push(styles.buttonMedium);
        break;
      case 'large':
        buttonStyles.push(styles.buttonLarge);
        break;
      default:
        buttonStyles.push(styles.buttonMedium);
    }
    
    // Add state styles
    if (disabled || loading) {
      buttonStyles.push(styles.buttonDisabled);
    }
    
    // Add custom styles
    buttonStyles.push(style);
    
    return buttonStyles;
  };
  
  /**
   * Get text styles based on variant and size
   */
  const getTextStyles = () => {
    let textStyles = [styles.text];
    
    // Add variant text styles
    switch (variant) {
      case 'primary':
        textStyles.push(styles.textPrimary);
        break;
      case 'secondary':
        textStyles.push(styles.textSecondary);
        break;
      case 'outline':
        textStyles.push(styles.textOutline);
        break;
      case 'ghost':
        textStyles.push(styles.textGhost);
        break;
      default:
        textStyles.push(styles.textPrimary);
    }
    
    // Add size text styles
    switch (size) {
      case 'small':
        textStyles.push(styles.textSmall);
        break;
      case 'medium':
        textStyles.push(styles.textMedium);
        break;
      case 'large':
        textStyles.push(styles.textLarge);
        break;
      default:
        textStyles.push(styles.textMedium);
    }
    
    // Add disabled text style
    if (disabled || loading) {
      textStyles.push(styles.textDisabled);
    }
    
    // Add custom text styles
    textStyles.push(textStyle);
    
    return textStyles;
  };
  
  /**
   * Get loading indicator color based on variant
   */
  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
        return colors.background;
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.primary;
      default:
        return colors.background;
    }
  };
  
  /**
   * Render button content (text, icon, loading indicator)
   */
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
          />
          {title && (
            <Text style={[getTextStyles(), styles.loadingText]}>
              {title}
            </Text>
          )}
        </View>
      );
    }
    
    if (children) {
      return children;
    }
    
    return (
      <View style={styles.contentContainer}>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <View style={[styles.iconContainer, styles.iconLeft]}>
            {icon}
          </View>
        )}
        
        {/* Button Text */}
        {title && (
          <Text style={getTextStyles()}>
            {title}
          </Text>
        )}
        
        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <View style={[styles.iconContainer, styles.iconRight]}>
            {icon}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={getButtonStyles()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...otherProps}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variant styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.base,
  },
  
  buttonSecondary: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  
  // Size styles
  buttonSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  
  buttonMedium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    minHeight: 48,
  },
  
  buttonLarge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  
  // State styles
  buttonDisabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    textAlign: 'center',
    fontWeight: typography.fontWeight.bold,
  },
  
  // Variant text styles
  textPrimary: {
    color: colors.background,
  },
  
  textSecondary: {
    color: colors.text,
  },
  
  textOutline: {
    color: colors.primary,
  },
  
  textGhost: {
    color: colors.primary,
  },
  
  // Size text styles
  textSmall: {
    fontSize: typography.fontSize.sm,
  },
  
  textMedium: {
    fontSize: typography.fontSize.base,
  },
  
  textLarge: {
    fontSize: typography.fontSize.lg,
  },
  
  // State text styles
  textDisabled: {
    opacity: 0.7,
  },
  
  // Content container
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Loading styles
  loadingText: {
    marginLeft: spacing.sm,
  },
  
  // Icon styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconLeft: {
    marginRight: spacing.sm,
  },
  
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;