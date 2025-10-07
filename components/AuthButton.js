/**
 * AuthButton Component
 * 
 * Handles Discogs OAuth authentication flow with user-friendly interface.
 * Manages the complete OAuth 1.0a flow including request token generation,
 * user authorization, and access token exchange.
 * 
 * Features:
 * - Step-by-step OAuth flow guidance
 * - Secure token storage
 * - Authentication status checking
 * - Error handling with user feedback
 * - Logout functionality
 */

import React, { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { getAccessToken, getRequestToken, isAuthenticated, logout } from '../api/oauth';
import { borderRadius, colors, spacing, typography } from '../styles/theme';
import Button from './Button';
import Input from './Input';

const AuthButton = ({ onAuthChange }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requestTokenData, setRequestTokenData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [authStep, setAuthStep] = useState(1); // 1: Get token, 2: Authorize, 3: Verify

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is currently authenticated
   */
  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
      onAuthChange?.(authenticated);
    } catch (error) {
      console.error('Auth status check failed:', error);
      setIsAuth(false);
      onAuthChange?.(false);
    }
  };

  /**
   * Step 1: Start OAuth flow by getting request token
   */
  const startAuthFlow = async () => {
    try {
      setIsLoading(true);
      setAuthStep(1);
      
      console.log('🔄 Starting OAuth authentication flow...');
      
      const tokenData = await getRequestToken();
      setRequestTokenData(tokenData);
      setAuthStep(2);
      
      // Show modal for next steps
      setShowAuthModal(true);
      
    } catch (error) {
      console.error('OAuth start failed:', error);
      Alert.alert(
        'Authentication Error',
        `Failed to start authentication: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 2: Open Discogs authorization URL
   */
  const openAuthorizationUrl = async () => {
    try {
      if (!requestTokenData?.authorizeUrl) {
        throw new Error('Authorization URL not available');
      }

      console.log('🔄 Opening Discogs authorization page...');
      
      const canOpen = await Linking.canOpenURL(requestTokenData.authorizeUrl);
      if (canOpen) {
        await Linking.openURL(requestTokenData.authorizeUrl);
        setAuthStep(3);
      } else {
        throw new Error('Cannot open browser for authorization');
      }
      
    } catch (error) {
      console.error('Authorization URL open failed:', error);
      Alert.alert(
        'Authorization Error',
        `Failed to open authorization page: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Step 3: Complete OAuth flow with verification code
   */
  const completeAuthFlow = async () => {
    try {
      if (!verificationCode.trim()) {
        Alert.alert('Missing Code', 'Please enter the verification code from Discogs.');
        return;
      }

      setIsLoading(true);
      
      console.log('🔄 Completing OAuth flow with verification code...');
      
      await getAccessToken(verificationCode.trim());
      
      // Update authentication status
      setIsAuth(true);
      onAuthChange?.(true);
      
      // Reset and close modal
      setShowAuthModal(false);
      setVerificationCode('');
      setRequestTokenData(null);
      setAuthStep(1);
      
      Alert.alert(
        'Authentication Successful',
        'You are now connected to Discogs and can search the database!',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('OAuth completion failed:', error);
      Alert.alert(
        'Authentication Error',
        `Failed to complete authentication: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear tokens
   */
  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout from Discogs?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await logout();
              setIsAuth(false);
              onAuthChange?.(false);
              Alert.alert('Logged Out', 'You have been logged out from Discogs.');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
    }
  };

  /**
   * Cancel authentication flow
   */
  const cancelAuthFlow = () => {
    setShowAuthModal(false);
    setVerificationCode('');
    setRequestTokenData(null);
    setAuthStep(1);
  };

  /**
   * Render authentication modal content based on current step
   */
  const renderModalContent = () => {
    switch (authStep) {
      case 2:
        return (
          <>
            <Text style={styles.modalTitle}>Authorize Discogs Access</Text>
            <Text style={styles.modalText}>
              Click the button below to open Discogs in your browser and authorize this app.
              After authorizing, you'll get a verification code to enter in the next step.
            </Text>
            <Button
              title="Open Discogs Authorization"
              onPress={openAuthorizationUrl}
              style={styles.modalButton}
            />
          </>
        );
        
      case 3:
        return (
          <>
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <Text style={styles.modalText}>
              Please enter the verification code you received from Discogs after authorizing the app.
            </Text>
            <Input
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter verification code..."
              label="Verification Code"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title="Complete Authentication"
              onPress={completeAuthFlow}
              loading={isLoading}
              disabled={!verificationCode.trim() || isLoading}
              style={styles.modalButton}
            />
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {isAuth ? (
        <Button
          title="Logout from Discogs"
          onPress={handleLogout}
          variant="outline"
          size="small"
        />
      ) : (
        <Button
          title="Login to Discogs"
          onPress={startAuthFlow}
          loading={isLoading}
          disabled={isLoading}
        />
      )}

      {/* Authentication Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={cancelAuthFlow}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {renderModalContent()}
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={cancelAuthFlow}
                variant="outline"
                style={styles.modalCancelButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textAccent,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  
  modalText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  modalButton: {
    marginTop: spacing.md,
  },
  
  modalActions: {
    marginTop: spacing.xl,
  },
  
  modalCancelButton: {
    marginTop: spacing.md,
  },
});

export default AuthButton;