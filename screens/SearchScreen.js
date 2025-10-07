/**
 * SearchScreen Component
 * 
 * Main screen for searching vinyl records with advanced filtering capabilities.
 * Integrates with Discogs API to fetch and display search results.
 * 
 * Features:
 * - Text-based search input
 * - Advanced filters (genre, style, price range, year range, artist, label)
 * - Animated dropdown filters
 * - Loading states during API calls
 * - Responsive design with smooth animations
 */

import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

// Import custom components
import { Button, Dropdown, Input } from '../components';

// Import API and theme
import { router } from 'expo-router';
import { advancedSearch, searchLabelsByReleaseCount } from '../api/discogs';
import { colors, commonStyles, spacing, typography } from '../styles/theme';

/**
 * Main SearchScreen functional component
 */
const SearchScreen = () => {
    // Main search query state (backward compatible naming)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 50,
  });
  
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);
  
  // Dropdown open/close state management
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Filter states for advanced search
  const [filters, setFilters] = useState({
    genre: '',
    style: '',
    artist: '',
    label: '',
    country: '',
    yearFrom: '',
    yearTo: '',
    minPrice: '',
    maxPrice: '',
    maxReleases: '',
  });
  
  // Filter options data
  const filterOptions = {
    genre: [
      { label: 'All Genres', value: '' },
      { label: 'Electronic', value: 'electronic' },
      { label: 'Rock', value: 'rock' },
      { label: 'Jazz', value: 'jazz' },
      { label: 'Hip Hop', value: 'hiphop' },
      { label: 'Blues', value: 'blues' },
      { label: 'Classical', value: 'classical' },
      { label: 'Pop', value: 'pop' },
      { label: 'Reggae', value: 'reggae' },
      { label: 'Country', value: 'country' },
      { label: 'Folk', value: 'folk' },
      { label: 'Funk', value: 'funk' },
      { label: 'Soul', value: 'soul' },
    ],
    
    style: [
      { label: 'All Styles', value: '' },
      { label: 'Techno', value: 'techno' },
      { label: 'House', value: 'house' },
      { label: 'Tech House', value: 'tech house' },
      { label: 'Deep House', value: 'deep house' },
      { label: 'Minimal', value: 'minimal' },
      { label: 'Electro', value: 'electro' },
      { label: 'Trance', value: 'trance' },
      { label: 'Drum & Bass', value: 'drum n bass' },
      { label: 'Dubstep', value: 'dubstep' },
      { label: 'Ambient', value: 'ambient' },
      { label: 'Industrial', value: 'industrial' },
      { label: 'Breakbeat', value: 'breakbeat' },
    ],
    
    country: [
      { label: 'All Countries', value: '' },
      { label: 'United States', value: 'US' },
      { label: 'United Kingdom', value: 'UK' },
      { label: 'Germany', value: 'Germany' },
      { label: 'France', value: 'France' },
      { label: 'Netherlands', value: 'Netherlands' },
      { label: 'Italy', value: 'Italy' },
      { label: 'Canada', value: 'Canada' },
      { label: 'Japan', value: 'Japan' },
      { label: 'Australia', value: 'Australia' },
      { label: 'Belgium', value: 'Belgium' },
      { label: 'Spain', value: 'Spain' },
      { label: 'Sweden', value: 'Sweden' },
      { label: 'Denmark', value: 'Denmark' },
      { label: 'Norway', value: 'Norway' },
      { label: 'Switzerland', value: 'Switzerland' },
    ],
    
    price: [
      { label: 'Any Price', value: '' },
      { label: '$0 - $10', value: '0-10' },
      { label: '$10 - $25', value: '10-25' },
      { label: '$25 - $50', value: '25-50' },
      { label: '$50 - $100', value: '50-100' },
      { label: '$100 - $200', value: '100-200' },
      { label: '$200+', value: '200+' },
    ],
    
    label: [
      { label: 'Any Label', value: '' },
      { label: 'Warp Records', value: 'warp' },
      { label: 'R&S Records', value: 'rs records' },
      { label: 'Tresor', value: 'tresor' },
      { label: 'Ostgut Ton', value: 'ostgut ton' },
      { label: 'Drumcode', value: 'drumcode' },
      { label: 'Cocoon', value: 'cocoon' },
      { label: 'Kompakt', value: 'kompakt' },
      { label: 'Underground Resistance', value: 'underground resistance' },
      { label: 'Soma Records', value: 'soma' },
      { label: 'Minus', value: 'minus' },
      { label: 'Defected', value: 'defected' },
      { label: 'Ninja Tune', value: 'ninja tune' },
    ],
  };
  
  // Generate year options (current year back to 1900)
  const yearOptions = [
    { label: 'Any Year', value: '' },
    ...Array.from({ length: 125 }, (_, i) => {
      const year = 2024 - i;
      return { label: year.toString(), value: year.toString() };
    }),
  ];
  
  /**
   * Handle dropdown toggle - closes other dropdowns when one opens
   * @param {string} dropdownName - Name of the dropdown to toggle
   */
  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };
  
  /**
   * Update filter value
   * @param {string} filterName - Name of the filter to update
   * @param {string} value - New filter value
   */
  const updateFilter = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  /**
   * Reset all filters to default values
   */
  const resetFilters = () => {
    setFilters({
      genre: '',
      style: '',
      artist: '',
      label: '',
      country: '',
      yearFrom: '',
      yearTo: '',
      minPrice: '',
      maxPrice: '',
      maxReleases: '',
    });
    setSearchQuery('');
    setOpenDropdown(null);
  };

  /**
   * Check if search should be enabled
   */
  const canSearch = () => {
    const hasSearchQuery = searchQuery.trim().length > 0;
    const hasFilters = Object.values(filters).some(filter => filter && filter.trim().length > 0);
    return hasSearchQuery || hasFilters;
  };
  
  /**
   * Handle search execution
   * Validates input and calls Discogs API with current search parameters
   */
  const handleSearch = async () => {
    try {
      // Check if we have either a search query or at least one filter
      const hasSearchQuery = searchQuery.trim().length > 0;
      const hasFilters = Object.values(filters).some(filter => filter && filter.trim().length > 0);
      
      if (!hasSearchQuery && !hasFilters) {
        Alert.alert(
          'Search Required',
          'Please enter a search term or select at least one filter to find records.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Close any open dropdowns
      setOpenDropdown(null);
      
      // Start loading state
      setIsLoading(true);
      
      // Prepare search parameters (normalized schema)
      const searchParams = {
        searchQuery: searchQuery.trim(),  // Will migrate to 'searchText'
        genre: filters.genre,
        style: filters.style,
        artist: filters.artist,
        label: filters.label,
        country: filters.country,
        yearFrom: parseInt(filters.yearFrom) || null,
        yearTo: parseInt(filters.yearTo) || null,
        priceMin: parseInt(filters.minPrice) || null, // Note: Discogs doesn't support price filtering
        priceMax: parseInt(filters.maxPrice) || null, // Note: Discogs doesn't support price filtering
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
      };
      
      console.log('🔍 Searching Discogs with parameters:', searchParams);
      
      // Check if we need to filter by label release count
      const hasReleaseCountFilter = filters.maxReleases;
      
      let results;
      
      if (hasReleaseCountFilter) {
        // Search for labels by release count first, then get their releases
        const minReleases = 0; // Always start from 0
        const maxReleases = parseInt(filters.maxReleases) || Infinity;
        
        console.log('🏷️ Filtering by label release count:', { minReleases, maxReleases });
        
        const filteredLabels = await searchLabelsByReleaseCount(
          filters.label || searchQuery.trim(), 
          minReleases, 
          maxReleases
        );
        
        if (filteredLabels.length === 0) {
          // No labels match the criteria
          results = {
            results: [],
            pagination: { items: 0, pages: 0, page: 1, per_page: 50 }
          };
        } else {
          // Search for releases from the filtered labels
          const labelNames = filteredLabels.map(label => label.title).slice(0, 5); // Limit to top 5 labels
          const labelSearchPromises = labelNames.map(labelName => {
            const labelSearchParams = {
              ...searchParams,
              label: labelName,
            };
            return advancedSearch(labelSearchParams);
          });
          
          const labelResults = await Promise.all(labelSearchPromises);
          
          // Combine results from all labels
          const combinedResults = labelResults.reduce((acc, result) => {
            if (result.results) {
              acc.push(...result.results);
            }
            return acc;
          }, []);
          
          // Remove duplicates based on ID
          const uniqueResults = combinedResults.filter((record, index, self) => 
            index === self.findIndex(r => r.id === record.id)
          );
          
          results = {
            results: uniqueResults.slice(0, 50), // Limit to 50 results
            pagination: { 
              items: uniqueResults.length, 
              pages: Math.ceil(uniqueResults.length / 50), 
              page: 1, 
              per_page: 50 
            }
          };
        }
      } else {
        // Regular search without release count filtering
        results = await advancedSearch(searchParams);
      }
      
      console.log(`✅ Search completed successfully. Found ${results.pagination?.items || 0} results`);
      
      // Navigate to results screen
      if (results.pagination?.items > 0) {
        router.push({
          pathname: '/search-results',
          params: {
            initialResults: JSON.stringify(results),
            searchQuery: searchQuery.trim(),
            searchParams: JSON.stringify(searchParams),
          }
        });
      } else {
        Alert.alert(
          'No Results',
          'No records found matching your search criteria. Try adjusting your filters or search terms.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      
      // Show appropriate error message
      let errorTitle = 'Search Error';
      let errorMessage = 'Failed to search records. Please try again.';
      
      if (error.message.includes('Authentication')) {
        errorTitle = 'Authentication Error';
        errorMessage = 'Please log out and log back in to Discogs.';
      } else if (error.message.includes('Rate limit')) {
        errorTitle = 'Too Many Requests';
        errorMessage = 'Please wait a moment before searching again.';
      } else if (error.message.includes('Network')) {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
      
    } finally {
      // End loading state
      setIsLoading(false);
    }
  };
  
  /**
   * Reset all filters and search query
   */
  const handleReset = () => {
    setSearchQuery('');
    setFilters({
      genre: '',
      style: '',
      minPrice: '',
      maxPrice: '',
      yearFrom: '',
      yearTo: '',
      artist: '',
      label: '',
    });
    setOpenDropdown(null);
    setSearchResults(null);
    setSearchError(null);
  };

  // Close dropdown when user scrolls
  const handleScroll = () => {
    if (openDropdown) {
      setOpenDropdown(null);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Screen Title */}
        <Text style={styles.title}>Search Records</Text>
        
        {/* Search Description */}
        <Text style={styles.searchDescription}>
          Search millions of records in the world's largest music database.
        </Text>
        
        {/* Authentication Section - Hidden for now */}
        {false && (
          <View style={styles.authSection}>
            <AuthButton onAuthChange={handleAuthChange} />
            {!isAuth && (
              <Text style={styles.authMessage}>
                Connect to Discogs to search millions of records in the world's largest music database.
              </Text>
            )}
          </View>
        )}
        
        {/* Main Search Input */}
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search records, artists, albums... (optional)"
          label="Search Query"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        
        {/* Search Button */}
        <Button
          title={isLoading ? "Searching..." : "Search Records"}
          onPress={handleSearch}
          disabled={isLoading || !canSearch()}
          style={styles.searchButton}
        />
        
        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          
          {/* Genre Filter */}
          <Dropdown
            label="Genre"
            value={filters.genre}
            onValueChange={(value) => updateFilter('genre', value)}
            options={filterOptions.genre}
            isOpen={openDropdown === 'genre'}
            onToggle={() => handleDropdownToggle('genre')}
            placeholder="Select genre..."
          />
          
          {/* Style Filter */}
          <Dropdown
            label="Style"
            value={filters.style}
            onValueChange={(value) => updateFilter('style', value)}
            options={filterOptions.style}
            isOpen={openDropdown === 'style'}
            onToggle={() => handleDropdownToggle('style')}
            placeholder="Select style..."
          />

          {/* Country Filter */}
          <Dropdown
            label="Country"
            value={filters.country}
            onValueChange={(value) => updateFilter('country', value)}
            options={filterOptions.country}
            isOpen={openDropdown === 'country'}
            onToggle={() => handleDropdownToggle('country')}
            placeholder="Select country..."
          />

          {/* Artist Filter - Optional Text Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Artist (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={filters.artist}
              onChangeText={(text) => updateFilter('artist', text)}
              placeholder="Enter artist name..."
              placeholderTextColor="rgba(223, 255, 0, 0.5)"
            />
          </View>
          
          {/* Label Filter */}
          <Dropdown
            label="Label"
            value={filters.label}
            onValueChange={(value) => updateFilter('label', value)}
            options={filterOptions.label}
            isOpen={openDropdown === 'label'}
            onToggle={() => handleDropdownToggle('label')}
            placeholder="Select label..."
          />
          
          {/* Price Range Filters */}
          <View style={styles.rangeContainer}>
            <View style={styles.rangeItem}>
              <Dropdown
                label="Min Price"
                value={filters.minPrice}
                onValueChange={(value) => updateFilter('minPrice', value)}
                options={filterOptions.price}
                isOpen={openDropdown === 'minPrice'}
                onToggle={() => handleDropdownToggle('minPrice')}
                placeholder="Min..."
              />
            </View>
            <View style={styles.rangeItem}>
              <Dropdown
                label="Max Price"
                value={filters.maxPrice}
                onValueChange={(value) => updateFilter('maxPrice', value)}
                options={filterOptions.price}
                isOpen={openDropdown === 'maxPrice'}
                onToggle={() => handleDropdownToggle('maxPrice')}
                placeholder="Max..."
              />
            </View>
          </View>
          
          {/* Year Range Filters */}
          <View style={styles.rangeContainer}>
            <View style={styles.rangeItem}>
              <Dropdown
                label="Year From"
                value={filters.yearFrom}
                onValueChange={(value) => updateFilter('yearFrom', value)}
                options={yearOptions}
                isOpen={openDropdown === 'yearFrom'}
                onToggle={() => handleDropdownToggle('yearFrom')}
                placeholder="From..."
              />
            </View>
            <View style={styles.rangeItem}>
              <Dropdown
                label="Year To"
                value={filters.yearTo}
                onValueChange={(value) => updateFilter('yearTo', value)}
                options={yearOptions}
                isOpen={openDropdown === 'yearTo'}
                onToggle={() => handleDropdownToggle('yearTo')}
                placeholder="To..."
              />
            </View>
          </View>

          {/* Label Release Count Section */}
          <Text style={styles.sectionSubtitle}>Max Label Releases</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Max Label Releases</Text>
            <TextInput
              style={styles.textInput}
              value={filters.maxReleases}
              onChangeText={(text) => updateFilter('maxReleases', text)}
              placeholder="e.g. 1000 (optional)"
              placeholderTextColor="rgba(223, 255, 0, 0.5)"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Search Button */}
          <Button
            title={isLoading ? "Searching..." : "Search Records"}
            onPress={handleSearch}
            disabled={isLoading || !canSearch()}
            style={styles.searchButton}
          />
          
          {/* Reset Button */}
          <Button
            title="Reset Search"
            onPress={resetFilters}
            variant="outline"
            disabled={isLoading}
            style={styles.resetButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container
  container: {
    ...commonStyles.container,
  },
  
  // Scroll view
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    ...commonStyles.contentContainer,
  },
  
  // Title
  title: {
    ...commonStyles.title,
    marginBottom: spacing.md, // 12px spacing below title
  },
  
  // Search description
  searchDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl, // 24px spacing below description
    paddingHorizontal: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  
  // Authentication section
  authSection: {
    marginBottom: spacing.xl, // 24px spacing below auth section
    alignItems: 'center',
  },
  
  authMessage: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    paddingHorizontal: spacing.base,
  },
  
  // Filters section
  filtersSection: {
    marginBottom: spacing.xl, // 24px spacing below filters
  },
  
  sectionTitle: {
    ...commonStyles.subtitle,
    marginBottom: spacing.lg, // 20px spacing below section title
  },

  sectionSubtitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.accent,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  // Range containers for price and year filters
  rangeContainer: {
    flexDirection: 'row',
    gap: spacing.md, // 12px gap between range items
  },
  
  rangeItem: {
    flex: 1, // Equal width for range items
  },
  
  // Input container styles
  inputContainer: {
    marginBottom: spacing.md,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.accent, // Yellow text for better visibility
    minHeight: 48,
  },

  // Action buttons
  actionButtons: {
    gap: spacing.md, // 12px gap between buttons
    marginBottom: spacing.xl, // 24px spacing below buttons
  },
  
  searchButton: {
    marginTop: spacing.lg, // 20px spacing above search button
    marginBottom: spacing.xl, // 24px spacing below search button
  },
  
  resetButton: {
    // Outline button styling from Button component
  },
  
  // Search header for results view
  searchHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  
  compactInput: {
    flex: 1,
  },
  
  compactSearchButton: {
    minWidth: 80,
  },
  
  // Full screen results
  fullScreenResults: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Results container (legacy)
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default SearchScreen;