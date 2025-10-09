/**
 * NavigationStateManager
 * 
 * Manages navigation state and prevents circular navigation loops
 * between record details and label releases screens.
 * 
 * Features:
 * - Tracks navigation history and current screen context
 * - Prevents navigation to the same item currently displayed
 * - Provides context-aware navigation decisions
 * - Maintains navigation breadcrumb for debugging
 */

class NavigationStateManager {
  constructor() {
    this.navigationHistory = [];
    this.currentScreen = null;
    this.currentItemId = null;
    this.maxHistoryLength = 10; // Prevent memory bloat
  }

  /**
   * Set the current screen context
   * @param {string} screenName - Name of the current screen
   * @param {string|number} itemId - ID or identifier of the current item
   * @param {Object} metadata - Additional context data
   */
  setCurrentScreen(screenName, itemId, metadata = {}) {
    const previousScreen = this.currentScreen;
    
    this.currentScreen = {
      name: screenName,
      itemId: itemId,
      timestamp: Date.now(),
      metadata: metadata
    };
    
    // Add to history (avoid duplicating consecutive identical entries)
    if (!previousScreen || 
        previousScreen.name !== screenName || 
        previousScreen.itemId !== itemId) {
      
      this.navigationHistory.push({
        ...this.currentScreen,
        action: 'navigate'
      });
      
      // Trim history to prevent memory issues
      if (this.navigationHistory.length > this.maxHistoryLength) {
        this.navigationHistory = this.navigationHistory.slice(-this.maxHistoryLength);
      }
    }
    
    console.log(`📍 Navigation: ${screenName} (${itemId})`, metadata);
  }

  /**
   * Check if navigation to a specific item would create a loop
   * @param {string} targetScreen - Target screen name
   * @param {string|number} targetItemId - Target item ID
   * @returns {boolean} - True if navigation should be prevented
   */
  wouldCreateLoop(targetScreen, targetItemId) {
    // Prevent navigation to the exact same screen+item
    if (this.currentScreen?.name === targetScreen && 
        this.currentScreen?.itemId === targetItemId) {
      console.log(`🚫 Navigation blocked: Already viewing ${targetScreen} (${targetItemId})`);
      return true;
    }

    // Check if we're navigating back to a recent item (potential immediate loop)
    const recentItems = this.navigationHistory.slice(-3); // Check last 3 navigations
    const hasRecentSimilar = recentItems.some(item => 
      item.name === targetScreen && item.itemId === targetItemId
    );

    if (hasRecentSimilar) {
      console.log(`🔄 Navigation blocked: Recent loop detected for ${targetScreen} (${targetItemId})`);
      return true;
    }

    return false;
  }

  /**
   * Check if we're currently in a record detail screen
   * @returns {boolean}
   */
  isInRecordDetail() {
    return this.currentScreen?.name === 'RecordDetail';
  }

  /**
   * Check if we're currently in a label releases screen
   * @returns {boolean}
   */
  isInLabelReleases() {
    return this.currentScreen?.name === 'LabelReleases';
  }

  /**
   * Get the current record ID (if in record detail screen)
   * @returns {string|null}
   */
  getCurrentRecordId() {
    return this.isInRecordDetail() ? this.currentScreen?.itemId : null;
  }

  /**
   * Get the current label name (if in label releases screen)
   * @returns {string|null}
   */
  getCurrentLabelName() {
    return this.isInLabelReleases() ? this.currentScreen?.itemId : null;
  }

  /**
   * Validate and execute navigation if allowed
   * @param {string} targetScreen - Target screen name
   * @param {string|number} targetItemId - Target item ID
   * @param {Function} navigationFunction - Function to execute navigation
   * @param {Object} metadata - Additional context data
   * @returns {boolean} - True if navigation was executed
   */
  navigateIfAllowed(targetScreen, targetItemId, navigationFunction, metadata = {}) {
    if (this.wouldCreateLoop(targetScreen, targetItemId)) {
      return false;
    }

    // Execute navigation
    navigationFunction();
    
    // Update state
    this.setCurrentScreen(targetScreen, targetItemId, metadata);
    
    return true;
  }

  /**
   * Get navigation history for debugging
   * @returns {Array} Navigation history
   */
  getHistory() {
    return [...this.navigationHistory];
  }

  /**
   * Clear navigation history (useful for testing or memory management)
   */
  clearHistory() {
    this.navigationHistory = [];
    this.currentScreen = null;
    console.log('🧹 Navigation history cleared');
  }

  /**
   * Get a summary of current navigation state
   * @returns {Object} Current state summary
   */
  getStateSummary() {
    return {
      currentScreen: this.currentScreen,
      historyLength: this.navigationHistory.length,
      recentHistory: this.navigationHistory.slice(-3)
    };
  }
}

// Create a singleton instance
const navigationStateManager = new NavigationStateManager();

export default navigationStateManager;