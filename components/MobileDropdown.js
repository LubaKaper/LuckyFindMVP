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
import React, { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { spacing, typography } from '../styles/theme';

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
    <View style={[styles.container, style]}>
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
    marginBottom: spacing.base,
    position: 'relative', // Important for absolute positioning
    zIndex: 1000, // Ensure dropdown appears above other elements
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: '#FFFFFF', // White label
    marginBottom: spacing.xs,
  },

  // Dropdown Button Styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: '#1a1a1a', // Dark background
    borderWidth: 1,
    borderColor: '#333333', // Dark border
    borderRadius: 8,
    minHeight: 48,
  },

  dropdownButtonActive: {
    borderColor: '#FFFF00', // Yellow border when open
    backgroundColor: '#2a2a2a', // Slightly lighter when open
  },

  dropdownButtonDisabled: {
    backgroundColor: '#0a0a0a',
    borderColor: '#666666',
    opacity: 0.6,
  },

  dropdownButtonError: {
    borderColor: '#F44336', // Red border for errors
  },

  dropdownButtonText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF', // White text
    marginRight: spacing.xs,
  },

  placeholderText: {
    color: '#CCCCCC', // Light gray for placeholder
    fontStyle: 'italic',
  },

  disabledText: {
    color: '#666666', // Gray for disabled
  },

  // Error Styles
  errorText: {
    fontSize: typography.fontSize.xs,
    color: '#F44336', // Red error text
    marginTop: spacing.xs,
  },

  // Options Container - Simple View instead of Modal
  optionsContainer: {
    position: 'absolute',
    top: '100%', // Position below the button
    left: 0,
    right: 0,
    backgroundColor: '#2a2a2a', // Dark background
    borderWidth: 1,
    borderColor: '#FFFF00', // Yellow border
    borderRadius: 8,
    maxHeight: 200, // Limit height
    zIndex: 1001, // Above container
    elevation: 10, // Android shadow
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', // Web shadow
  },

  optionsList: {
    flex: 1,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#333333', // Dark separator
  },

  optionItemLast: {
    borderBottomWidth: 0,
  },

  optionItemSelected: {
    backgroundColor: '#FFFF0033', // Yellow with transparency
  },

  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF', // White text
  },

  optionTextSelected: {
    color: '#FFFF00', // Yellow for selected
    fontWeight: typography.fontWeight.medium,
  },

  // Empty State
  emptyContainer: {
    padding: spacing.base,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: typography.fontSize.base,
    color: '#CCCCCC', // Light gray
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MobileDropdown;