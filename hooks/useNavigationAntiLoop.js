/**
 * useNavigationAntiLoop Hook
 * 
 * Provides anti-loop navigation utilities and context awareness
 * for preventing circular navigation between record details and label releases.
 * 
 * Features:
 * - Context-aware navigation decisions
 * - Anti-loop protection for record/label navigation
 * - Navigation state tracking and debugging
 * - Performance optimized with useCallback
 */

import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import navigationStateManager from '../utils/NavigationStateManager';

/**
 * Custom hook for anti-loop navigation management
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation utilities and state
 */
export const useNavigationAntiLoop = (options = {}) => {
  const {
    currentScreenType = null,  // 'RecordDetail' or 'LabelReleases'
    currentItemId = null,      // Current record ID or label name
    currentItemData = null     // Additional context data
  } = options;

  /**
   * Navigate to record detail with anti-loop protection
   */
  const navigateToRecord = useCallback((record, context = {}) => {
    if (!record) {
      console.warn('⚠️ Cannot navigate: No record data provided');
      return false;
    }

    const recordId = record.id || record.title || 'unknown';
    const { fromLabelName, metadata = {} } = context;

    const success = navigationStateManager.navigateIfAllowed(
      'RecordDetail',
      recordId,
      () => {
        console.log('📀 Navigating to record:', record.title || recordId);
        router.push({
          pathname: '/record-detail',
          params: { 
            record: JSON.stringify(record),
            fromLabelName: fromLabelName || undefined
          }
        });
      },
      {
        fromScreen: currentScreenType,
        fromItemId: currentItemId,
        recordTitle: record.title,
        recordId: recordId,
        ...metadata
      }
    );

    if (!success) {
      console.log('🚫 Record navigation blocked to prevent loop');
    }

    return success;
  }, [currentScreenType, currentItemId]);

  /**
   * Navigate to label releases with anti-loop protection
   */
  const navigateToLabel = useCallback((labelData, context = {}) => {
    if (!labelData) {
      console.warn('⚠️ Cannot navigate: No label data provided');
      return false;
    }

    // Extract clean label name
    let labelName = '';
    if (Array.isArray(labelData)) {
      labelName = labelData[0];
    } else if (typeof labelData === 'string') {
      labelName = labelData;
    }

    if (labelName?.includes(' - ')) {
      labelName = labelName.split(' - ')[0];
    }

    if (!labelName?.trim()) {
      console.warn('⚠️ Cannot navigate: Invalid label name');
      return false;
    }

    const cleanLabelName = labelName.trim();
    const { fromRecordId, metadata = {} } = context;

    const success = navigationStateManager.navigateIfAllowed(
      'LabelReleases',
      cleanLabelName,
      () => {
        console.log('🏷️ Navigating to label:', cleanLabelName);
        router.push({
          pathname: '/label-releases',
          params: { 
            labelName: cleanLabelName,
            fromRecordId: fromRecordId || undefined
          }
        });
      },
      {
        fromScreen: currentScreenType,
        fromItemId: currentItemId,
        labelName: cleanLabelName,
        ...metadata
      }
    );

    if (!success) {
      console.log('🚫 Label navigation blocked to prevent loop');
    }

    return success;
  }, [currentScreenType, currentItemId]);

  /**
   * Check if a label should be clickable (anti-loop logic)
   */
  const isLabelClickable = useCallback((labelData) => {
    if (!labelData) return false;

    // Extract clean label name
    let labelName = '';
    if (Array.isArray(labelData)) {
      labelName = labelData[0];
    } else if (typeof labelData === 'string') {
      labelName = labelData;
    }

    if (labelName?.includes(' - ')) {
      labelName = labelName.split(' - ')[0];
    }

    const cleanLabelName = labelName?.trim();
    if (!cleanLabelName) return false;

    // Check if we're currently viewing this label's releases
    const currentLabelName = navigationStateManager.getCurrentLabelName();
    
    return !(currentLabelName && 
             currentLabelName.toLowerCase() === cleanLabelName.toLowerCase());
  }, []);

  /**
   * Check if a record should be clickable (anti-loop logic)
   */
  const isRecordClickable = useCallback((record) => {
    if (!record) return false;

    const recordId = record.id || record.title || 'unknown';
    const currentRecordId = navigationStateManager.getCurrentRecordId();
    
    return !(currentRecordId && currentRecordId === recordId);
  }, []);

  /**
   * Get navigation context for the current screen
   */
  const navigationContext = useMemo(() => {
    return {
      isInRecordDetail: navigationStateManager.isInRecordDetail(),
      isInLabelReleases: navigationStateManager.isInLabelReleases(),
      currentRecordId: navigationStateManager.getCurrentRecordId(),
      currentLabelName: navigationStateManager.getCurrentLabelName(),
      stateSummary: navigationStateManager.getStateSummary()
    };
  }, [currentScreenType, currentItemId]);

  /**
   * Navigate back with context awareness
   */
  const navigateBack = useCallback(() => {
    console.log('⬅️ Navigating back from', currentScreenType);
    router.back();
  }, [currentScreenType]);

  /**
   * Clear navigation history (useful for reset/debugging)
   */
  const clearNavigationHistory = useCallback(() => {
    navigationStateManager.clearHistory();
  }, []);

  return {
    // Navigation functions
    navigateToRecord,
    navigateToLabel,
    navigateBack,
    
    // Context checks
    isLabelClickable,
    isRecordClickable,
    navigationContext,
    
    // Utilities
    clearNavigationHistory,
    
    // Debug info
    getNavigationHistory: navigationStateManager.getHistory.bind(navigationStateManager),
    getStateSummary: navigationStateManager.getStateSummary.bind(navigationStateManager)
  };
};

export default useNavigationAntiLoop;