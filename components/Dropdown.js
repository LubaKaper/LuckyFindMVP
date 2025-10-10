/**
 * MOBILE-OPTIMIZED Dropdown Component
 * 
 * Simplified dropdown that works reliably on iOS and Android:
 * - No Modal component (causes issues on native)
 * - Simple absolute positioning
 * - Better mobile touch handling
 * - Explicit colors for visibility
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import sophisticatedTheme from '../styles/sophisticatedTheme';

const { colors, spacing, typography, shadows } = sophisticatedTheme;

/**
 * Simple Option Item Component
 */
const OptionItem = ({ item, isSelected, onPress, isLast }) => {
  const handlePress = () => onPress(item.value, item.label);

  return (
    <Pressable
      style={[
        styles.optionItem,
        isSelected && styles.optionItemSelected,
        isLast && styles.optionItemLast,
      ]}
      onPress={handlePress}
    >
      <Text style={[
        styles.optionText,
        isSelected && styles.optionTextSelected
      ]}>
        {item.label}
      </Text>
      
      {isSelected && (
        <Ionicons 
          name="checkmark" 
          size={20} 
          color="#FFFF00"
        />
      )}
    </Pressable>
  );
};

/**
 * Mobile-Optimized Dropdown Component
 */
const MobileDropdown = ({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = 'Select an option...',
  isOpen = false,
  onToggle,
  disabled = false,
  style,
  error,
}) => {
  // Find selected option
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption?.label || placeholder;

  // Handle option selection
  const handleOptionSelect = useCallback((optionValue, optionLabel) => {
    console.log(`📋 Dropdown "${label}" selected:`, { value: optionValue, label: optionLabel });
    
    if (onValueChange) {
      onValueChange(optionValue);
    }
    
    // Close dropdown
    if (onToggle) {
      onToggle();
    }
  }, [label, onValueChange, onToggle]);

  // Handle dropdown toggle
  const handleToggle = useCallback(() => {
    if (disabled) return;
    
    if (onToggle) {
      onToggle();
    }
  }, [disabled, onToggle]);

  return (
    <View style={[
      styles.container, 
      style,
      { zIndex: isOpen ? 1000 : 1 } // Higher z-index when open
    ]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      
      {/* Dropdown Button */}
      <Pressable
        style={[
          styles.dropdownButton,
          isOpen && styles.dropdownButtonActive,
          disabled && styles.dropdownButtonDisabled,
          error && styles.dropdownButtonError,
        ]}
        onPress={handleToggle}
        disabled={disabled}
      >
        <Text style={[
          styles.dropdownButtonText,
          !selectedOption && styles.placeholderText,
          disabled && styles.disabledText,
        ]}>
          {displayText}
        </Text>
        
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20} 
          color={disabled ? "#666666" : "#CCCCCC"} 
        />
      </Pressable>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Options List - Simple View instead of Modal */}
      {isOpen && (
        <View style={styles.optionsContainer}>
          <ScrollView 
            style={styles.optionsList}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {options.length > 0 ? (
              options.map((item, index) => (
                <OptionItem
                  key={`${item.value}-${index}`}
                  item={item}
                  isSelected={item.value === value}
                  onPress={handleOptionSelect}
                  isLast={index === options.length - 1}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No options available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
    position: 'relative',
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  // Dropdown Button Styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 48,
    ...shadows.sm,
  },

  dropdownButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },

  dropdownButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.borderLight,
    opacity: 0.6,
  },

  dropdownButtonError: {
    borderColor: colors.error,
  },

  dropdownButtonText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginRight: spacing.xs,
  },

  placeholderText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  disabledText: {
    color: colors.textTertiary,
  },

  // Error Styles
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },

  // Options Container - Simple View instead of Modal
  optionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 20,
    ...shadows.lg,
  },

  optionsList: {
    flex: 1,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  optionItemLast: {
    borderBottomWidth: 0,
  },

  optionItemSelected: {
    backgroundColor: colors.accent + '20',
  },

  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },

  optionTextSelected: {
    color: colors.accent,
    fontWeight: typography.fontWeight.medium,
  },

  // Empty State
  emptyContainer: {
    padding: spacing.base,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MobileDropdown;