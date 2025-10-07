/**
 * Dropdown Component
 * 
 * A reusable animated dropdown component with customizable options.
 * Features smooth open/close animations and touch interaction.
 * 
 * Props:
 * - label: Display label for the dropdown
 * - value: Currently selected value
 * - onValueChange: Callback when value changes
 * - options: Array of {label, value} objects
 * - isOpen: Boolean controlling open/close state
 * - onToggle: Callback to toggle dropdown open/close
 * - placeholder: Optional placeholder text
 * - disabled: Optional disabled state
 */

import React, { useEffect, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { animations, borderRadius, colors, spacing, typography } from '../styles/theme';

const Dropdown = ({
  label,
  value,
  onValueChange,
  options = [],
  isOpen = false,
  onToggle,
  placeholder = 'Select...',
  disabled = false,
}) => {
  // Animation value for dropdown height
  const [animationValue] = useState(new Animated.Value(0));
  
  // Effect to handle animation when dropdown opens/closes
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isOpen ? 1 : 0,
      duration: animations.base, // 300ms
      useNativeDriver: false, // Height animation requires layout changes
    }).start();
  }, [isOpen, animationValue]);
  
  // Interpolate animation value to height
  const animatedHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150], // Max height of 150px for dropdown content
  });
  
  // Find the display value for the selected option
  const displayValue = options.find(option => option.value === value)?.label || '';
  
  /**
   * Handle option selection
   * @param {string} optionValue - Selected option value
   */
  const handleOptionSelect = (optionValue) => {
    onValueChange(optionValue);
    onToggle(); // Close dropdown after selection
  };
  
  return (
    <View style={styles.container}>
      {/* Dropdown Header */}
      <TouchableOpacity
        style={[
          styles.header,
          disabled && styles.headerDisabled,
          isOpen && styles.headerOpen,
        ]}
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {/* Label */}
        <Text style={styles.label}>{label}</Text>
        
        {/* Selected Value */}
        <Text style={[
          styles.value,
          !displayValue && styles.placeholder
        ]}>
          {displayValue || placeholder}
        </Text>
        
        {/* Arrow Icon */}
        <Animated.Text
          style={[
            styles.arrow,
            {
              transform: [{
                rotate: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              }],
            },
          ]}
        >
          ▼
        </Animated.Text>
      </TouchableOpacity>
      
      {/* Dropdown Content */}
      <Animated.View
        style={[
          styles.content,
          { height: animatedHeight },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value || index}
              style={[
                styles.option,
                value === option.value && styles.optionSelected,
                index === options.length - 1 && styles.optionLast, // Remove border for last item
              ]}
              onPress={() => handleOptionSelect(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base, // 16px margin between dropdowns
  },
  
  // Header styles
  header: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.base, // 16px padding
    borderRadius: borderRadius.lg, // 10px border radius
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48, // Consistent touch target size
  },
  
  headerDisabled: {
    opacity: 0.5,
    backgroundColor: colors.backgroundTertiary,
  },
  
  headerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  
  // Label styles
  label: {
    color: colors.textAccent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.sm, // 8px spacing
  },
  
  // Value display styles
  value: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    flex: 1,
    marginLeft: spacing.sm, // 8px spacing from label
  },
  
  placeholder: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Arrow styles
  arrow: {
    color: colors.textAccent,
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.sm, // 8px spacing
  },
  
  // Content styles
  content: {
    backgroundColor: colors.backgroundTertiary,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    overflow: 'hidden', // Ensure content doesn't overflow during animation
  },
  
  scrollView: {
    maxHeight: 150, // Match the animated height
  },
  
  // Option styles
  option: {
    padding: spacing.md, // 12px padding for comfortable touch targets
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
    backgroundColor: 'transparent',
  },
  
  optionSelected: {
    backgroundColor: colors.primary,
  },
  
  optionLast: {
    borderBottomWidth: 0, // Remove border for last option
  },
  
  // Option text styles
  optionText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
  },
  
  optionTextSelected: {
    color: colors.background,
    fontWeight: typography.fontWeight.medium,
  },
});

export default Dropdown;