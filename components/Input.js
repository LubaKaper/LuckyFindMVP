/**
 * Input Component
 * 
 * A reusable text input component with consistent styling and optional features.
 * Supports different input types, validation states, and custom styling.
 * 
 * Props:
 * - value: Current input value
 * - onChangeText: Callback when text changes
 * - placeholder: Placeholder text
 * - label: Optional label above input
 * - error: Error message to display
 * - disabled: Disable input interaction
 * - secureTextEntry: Hide text for passwords
 * - keyboardType: Keyboard type for input
 * - autoCapitalize: Auto-capitalization behavior
 * - autoCorrect: Auto-correction behavior
 * - maxLength: Maximum character length
 * - multiline: Allow multiple lines
 * - numberOfLines: Number of lines for multiline input
 * - style: Custom style object
 * - containerStyle: Custom container style
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import sophisticatedTheme from '../styles/sophisticatedTheme';

const { colors, spacing, typography, shadows } = sophisticatedTheme;

const Input = ({
  value,
  onChangeText,
  placeholder = '',
  label,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style = {},
  containerStyle = {},
  ...otherProps
}) => {
  // Track focus state for styling
  const [isFocused, setIsFocused] = useState(false);
  
  /**
   * Handle input focus
   */
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  /**
   * Handle input blur
   */
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // Determine input container style based on state
  const getInputContainerStyle = () => {
    let containerStyles = [styles.inputContainer];
    
    if (isFocused) {
      containerStyles.push(styles.inputContainerFocused);
    }
    
    if (error) {
      containerStyles.push(styles.inputContainerError);
    }
    
    if (disabled) {
      containerStyles.push(styles.inputContainerDisabled);
    }
    
    return containerStyles;
  };
  
  // Determine input text style based on state
  const getInputTextStyle = () => {
    let textStyles = [styles.input];
    
    if (disabled) {
      textStyles.push(styles.inputDisabled);
    }
    
    if (multiline) {
      textStyles.push(styles.inputMultiline);
    }
    
    // Apply custom styles
    textStyles.push(style);
    
    return textStyles;
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      {/* Input Container */}
      <View style={getInputContainerStyle()}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={getInputTextStyle()}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...otherProps}
        />
      </View>
      
      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  
  // Label styles
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  // Input container styles
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    ...shadows.sm,
  },
  
  inputContainerFocused: {
    borderColor: colors.accent,
    borderWidth: 2,
    ...shadows.md,
  },
  
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  inputContainerDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.borderLight,
    opacity: 0.6,
  },
  
  // Input text styles
  input: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  
  inputDisabled: {
    color: colors.textSecondary,
  },
  
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  
  // Error text styles
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Input;