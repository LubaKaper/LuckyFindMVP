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
    View,
} from 'react-native';

// Import custom components
import { Button, Dropdown, Input } from '../components';

// Import API and theme
import { router } from 'expo-router';
import { advancedSearch } from '../api/discogs';
import { colors, commonStyles, spacing, typography } from '../styles/theme';

/**
 * Main SearchScreen functional component
 */
const SearchScreen = () => {
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  
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
    yearFrom: '',
    yearTo: '',
    minPrice: '',
    maxPrice: '',
  });
  
  // Filter options data
  const filterOptions = {
    genre: [
      { label: 'All Genres', value: '' },
      { label: 'Rock', value: 'rock' },
      { label: 'Jazz', value: 'jazz' },
      { label: 'Blues', value: 'blues' },
      { label: 'Classical', value: 'classical' },
      { label: 'Electronic', value: 'electronic' },
      { label: 'Hip Hop', value: 'hiphop' },
      { label: 'Pop', value: 'pop' },
      { label: 'Reggae', value: 'reggae' },
      { label: 'Country', value: 'country' },
      { label: 'Folk', value: 'folk' },
      { label: 'Funk', value: 'funk' },
      { label: 'Soul', value: 'soul' },
    ],
    
    style: [
      { label: 'All Formats', value: '' },
      { label: 'Vinyl', value: 'vinyl' },
      { label: 'LP', value: 'lp' },
      { label: '12"', value: '12inch' },
      { label: '7"', value: '7inch' },
      { label: 'EP', value: 'ep' },
      { label: 'CD', value: 'cd' },
      { label: 'Cassette', value: 'cassette' },
      { label: 'Digital', value: 'digital' },
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
    
    artist: [
      { label: 'Any Artist', value: '' },
      { label: 'The Beatles', value: 'beatles' },
      { label: 'Led Zeppelin', value: 'ledzeppelin' },
      { label: 'Pink Floyd', value: 'pinkfloyd' },
      { label: 'Miles Davis', value: 'milesdavis' },
      { label: 'Bob Dylan', value: 'bobdylan' },
      { label: 'David Bowie', value: 'davidbowie' },
      { label: 'The Rolling Stones', value: 'rollingstones' },
      { label: 'Jimi Hendrix', value: 'jimihendrix' },
      { label: 'John Coltrane', value: 'johncoltrane' },
    ],
    
    label: [
      { label: 'Any Label', value: '' },
      { label: 'Capitol Records', value: 'capitol' },
      { label: 'Columbia Records', value: 'columbia' },
      { label: 'Atlantic Records', value: 'atlantic' },
      { label: 'Blue Note', value: 'bluenote' },
      { label: 'Motown', value: 'motown' },
      { label: 'Warner Bros', value: 'warner' },
      { label: 'EMI', value: 'emi' },
      { label: 'RCA Records', value: 'rca' },
      { label: 'Decca', value: 'decca' },
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
   * Handle search execution
   * Validates input and calls Discogs API with current search parameters
   */
  const handleSearch = async () => {
    try {
      // Validate search query
      if (!searchQuery.trim()) {
        Alert.alert(
          'Search Required',
          'Please enter a search term to find records.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Close any open dropdowns
      setOpenDropdown(null);
      
      // Start loading state
      setIsLoading(true);
      
      // Prepare search parameters
      const searchParams = {
        searchQuery: searchQuery.trim(),
        genre: filters.genre,
        style: filters.style,
        artist: filters.artist,
        label: filters.label,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        priceMin: filters.minPrice, // Note: Discogs doesn't support price filtering
        priceMax: filters.maxPrice, // Note: Discogs doesn't support price filtering
        page: 1,
        per_page: 50,
      };
      
      console.log('🔍 Searching Discogs with parameters:', searchParams);
      
      // Call Discogs API
      const results = await advancedSearch(searchParams);
      
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
          placeholder="Search records, artists, albums..."
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
          disabled={isLoading || !searchQuery.trim()}
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
          
          {/* Style/Format Filter */}
          <Dropdown
            label="Format"
            value={filters.style}
            onValueChange={(value) => updateFilter('style', value)}
            options={filterOptions.style}
            isOpen={openDropdown === 'style'}
            onToggle={() => handleDropdownToggle('style')}
            placeholder="Select format..."
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
          
          {/* Artist Filter */}
          <Dropdown
            label="Artist"
            value={filters.artist}
            onValueChange={(value) => updateFilter('artist', value)}
            options={filterOptions.artist}
            isOpen={openDropdown === 'artist'}
            onToggle={() => handleDropdownToggle('artist')}
            placeholder="Select artist..."
          />
          
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
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Search Button */}
          <Button
            title={isLoading ? "Searching..." : "Search Records"}
            onPress={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            style={styles.searchButton}
          />
          
          {/* Reset Button */}
          <Button
            title="Reset Filters"
            onPress={handleReset}
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
  
  // Range containers for price and year filters
  rangeContainer: {
    flexDirection: 'row',
    gap: spacing.md, // 12px gap between range items
  },
  
  rangeItem: {
    flex: 1, // Equal width for range items
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