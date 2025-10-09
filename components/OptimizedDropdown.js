/**
 * OPTIMIZED Dropdown Component Implementation
 * 
 * Refactored with performance best practices:
 * - React.memo for preventing unnecessary re-renders
 * - useCallback for stable function references
 * - useMemo for expensive computations
 * - Optimized animations with native driver
 * - Proper cleanup and memory management
 * - Virtual scrolling for large option lists
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, spacing, typography } from '../styles/theme';

// ==========================================
// OPTIMIZED OPTION ITEM COMPONENT
// ==========================================

/**
 * Memoized option item to prevent unnecessary re-renders
 */
const OptimizedOptionItem = React.memo(({
  item,
  isSelected,
  onPress,
  isLast,
}) => {
  // Memoized press handler
  const handlePress = useCallback(() => {
    onPress(item.value, item.label);
  }, [onPress, item.value, item.label]);

  // Memoized styles
  const itemStyles = useMemo(() => [
    styles.optionItem,
    isSelected && styles.optionItemSelected,
    isLast && styles.optionItemLast,
  ], [isSelected, isLast]);

  const textStyles = useMemo(() => [
    styles.optionText,
    isSelected && styles.optionTextSelected,
  ], [isSelected]);

  return (
    <Pressable
      style={({ pressed }) => [
        itemStyles,
        pressed && styles.optionItemPressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Select ${item.label}`}
    >
      <Text style={textStyles} numberOfLines={1}>
        {item.label}
      </Text>
      
      {isSelected && (
        <Ionicons 
          name="checkmark" 
          size={20} 
          color={colors.primary} 
          style={styles.checkIcon}
        />
      )}
    </Pressable>
  );
});

OptimizedOptionItem.displayName = 'OptimizedOptionItem';

// ==========================================
// MAIN DROPDOWN COMPONENT
// ==========================================

/**
 * Optimized Dropdown Component
 */
const OptimizedDropdown = React.memo(({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = 'Select an option...',
  isOpen = false,
  onToggle,
  disabled = false,
  maxHeight = 300,
  searchable = false,
  style,
  error,
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation references
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  
  // Component references
  const flatListRef = useRef(null);
  const searchInputRef = useRef(null);

  // ==========================================
  // MEMOIZED COMPUTATIONS
  // ==========================================

  /**
   * Memoized filtered options based on search query
   */
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable]);

  /**
   * Memoized selected option for display
   */
  const selectedOption = useMemo(() => 
    options.find(option => option.value === value),
    [options, value]
  );

  /**
   * Memoized display text
   */
  const displayText = useMemo(() => 
    selectedOption?.label || placeholder,
    [selectedOption, placeholder]
  );

  /**
   * Memoized dropdown button styles
   */
  const dropdownButtonStyles = useMemo(() => [
    styles.dropdownButton,
    isOpen && styles.dropdownButtonActive,
    disabled && styles.dropdownButtonDisabled,
    error && styles.dropdownButtonError,
    style,
  ], [isOpen, disabled, error, style]);

  /**
   * Memoized text styles
   */
  const displayTextStyles = useMemo(() => [
    styles.dropdownButtonText,
    !selectedOption && styles.placeholderText,
    disabled && styles.disabledText,
  ], [selectedOption, disabled]);

  // ==========================================
  // ANIMATION MANAGEMENT
  // ==========================================

  /**
   * Optimized rotation animation
   */
  const animateRotation = useCallback((toValue) => {
    Animated.timing(rotateAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [rotateAnimation]);

  /**
   * Optimized fade animation
   */
  const animateFade = useCallback((toValue, callback) => {
    Animated.timing(fadeAnimation, {
      toValue,
      duration: 150,
      useNativeDriver: true,
    }).start(callback);
  }, [fadeAnimation]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  /**
   * Optimized dropdown toggle handler
   */
  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    
    // Call parent toggle handler
    if (onToggle) {
      onToggle();
    }
    
    // Handle modal visibility
    if (newIsOpen) {
      setModalVisible(true);
      animateFade(1);
    } else {
      animateFade(0, () => {
        setModalVisible(false);
      });
    }
    
    // Animate rotation
    animateRotation(newIsOpen ? 1 : 0);
    
    // Clear search when closing
    if (!newIsOpen) {
      setSearchQuery('');
    }
  }, [disabled, isOpen, onToggle, animateFade, animateRotation]);

  /**
   * Optimized option selection handler
   */
  const handleOptionSelect = useCallback((optionValue, optionLabel) => {
    console.log(`📋 Dropdown "${label}" selected:`, { value: optionValue, label: optionLabel });
    
    // Update value
    if (onValueChange) {
      onValueChange(optionValue);
    }
    
    // Close dropdown
    handleToggle();
    
    // Clear search
    setSearchQuery('');
  }, [label, onValueChange, handleToggle]);

  /**
   * Optimized search handler
   */
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  /**
   * Optimized modal close handler
   */
  const handleModalClose = useCallback(() => {
    if (isOpen) {
      handleToggle();
    }
  }, [isOpen, handleToggle]);

  // ==========================================
  // FLATLIST OPTIMIZATION
  // ==========================================

  /**
   * Optimized key extractor
   */
  const keyExtractor = useCallback((item, index) => 
    `${item.value}-${index}`, 
    []
  );

  /**
   * Optimized render item function
   */
  const renderOptionItem = useCallback(({ item, index }) => (
    <OptimizedOptionItem
      item={item}
      isSelected={item.value === value}
      onPress={handleOptionSelect}
      isLast={index === filteredOptions.length - 1}
    />
  ), [value, handleOptionSelect, filteredOptions.length]);

  /**
   * Optimized item layout for better performance
   */
  const getItemLayout = useCallback((data, index) => ({
    length: OPTION_ITEM_HEIGHT,
    offset: OPTION_ITEM_HEIGHT * index,
    index,
  }), []);

  // ==========================================
  // LIFECYCLE MANAGEMENT
  // ==========================================

  /**
   * Sync modal visibility with isOpen prop
   */
  useEffect(() => {
    if (isOpen && !modalVisible) {
      setModalVisible(true);
      animateFade(1);
      animateRotation(1);
    } else if (!isOpen && modalVisible) {
      animateFade(0, () => {
        setModalVisible(false);
      });
      animateRotation(0);
      setSearchQuery('');
    }
  }, [isOpen, modalVisible, animateFade, animateRotation]);

  /**
   * Auto-focus search input when modal opens
   */
  useEffect(() => {
    if (modalVisible && searchable && searchInputRef.current) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [modalVisible, searchable]);

  // ==========================================
  // ANIMATION VALUES
  // ==========================================

  const rotateInterpolation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      
      {/* Dropdown Button */}
      <Pressable
        style={({ pressed }) => [
          dropdownButtonStyles,
          pressed && !disabled && styles.dropdownButtonPressed,
        ]}
        onPress={handleToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ 
          expanded: isOpen,
          disabled: disabled,
        }}
        accessibilityLabel={`${label || 'Dropdown'}, ${displayText}`}
      >
        <Text style={displayTextStyles} numberOfLines={1}>
          {displayText}
        </Text>
        
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ rotate: rotateInterpolation }] },
          ]}
        >
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={disabled ? colors.disabled : colors.textSecondary} 
          />
        </Animated.View>
      </Pressable>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Options Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleModalClose}
        statusBarTranslucent={true}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={handleModalClose}
          accessibilityRole="button"
          accessibilityLabel="Close dropdown"
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: fadeAnimation,
                transform: [{
                  scale: fadeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  })
                }]
              }
            ]}
          >
            <Pressable style={styles.modalInner} onPress={() => {}}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {label || 'Select Option'}
                </Text>
                
                <Pressable 
                  style={styles.closeButton}
                  onPress={handleModalClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Search Input (if searchable) */}
              {searchable && (
                <View style={styles.searchContainer}>
                  <Ionicons 
                    name="search" 
                    size={20} 
                    color={colors.textSecondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder={`Search ${label?.toLowerCase() || 'options'}...`}
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="search"
                  />
                </View>
              )}

              {/* Options List */}
              {filteredOptions.length > 0 ? (
                <FlatList
                  ref={flatListRef}
                  data={filteredOptions}
                  renderItem={renderOptionItem}
                  keyExtractor={keyExtractor}
                  getItemLayout={getItemLayout}
                  style={[styles.optionsList, { maxHeight }]}
                  showsVerticalScrollIndicator={true}
                  initialNumToRender={10}
                  windowSize={5}
                  removeClippedSubviews={true}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No matching options found' : 'No options available'}
                  </Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
});

OptimizedDropdown.displayName = 'OptimizedDropdown';

// ==========================================
// CONSTANTS AND STYLES
// ==========================================

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const OPTION_ITEM_HEIGHT = 48;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    minHeight: 48,
  },

  dropdownButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },

  dropdownButtonPressed: {
    backgroundColor: colors.surfaceVariant,
  },

  dropdownButtonDisabled: {
    backgroundColor: colors.disabled + '20',
    borderColor: colors.disabled,
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
    color: colors.disabled,
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error Styles
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.7,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  modalInner: {
    flex: 1,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },

  closeButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },

  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: spacing.xs,
  },

  // Options List Styles
  optionsList: {
    flex: 1,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    height: OPTION_ITEM_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  optionItemLast: {
    borderBottomWidth: 0,
  },

  optionItemPressed: {
    backgroundColor: colors.surfaceVariant,
  },

  optionItemSelected: {
    backgroundColor: colors.primary + '20',
  },

  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },

  optionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },

  checkIcon: {
    marginLeft: spacing.sm,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default OptimizedDropdown;