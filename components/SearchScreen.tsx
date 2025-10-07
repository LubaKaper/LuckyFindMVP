import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface FilterDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  isOpen: boolean;
  onToggle: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onValueChange,
  options,
  isOpen,
  onToggle,
}) => {
  const [animation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, animation]);

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle}>
        <Text style={styles.dropdownLabel}>{label}</Text>
        <Text style={styles.dropdownValue}>{value || 'Select...'}</Text>
        <Text style={[styles.dropdownArrow, { transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }]}>
          ▼
        </Text>
      </TouchableOpacity>
      <Animated.View style={[styles.dropdownContent, { height: animatedHeight }]}>
        <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownOption,
                value === option.value && styles.dropdownOptionSelected,
              ]}
              onPress={() => {
                onValueChange(option.value);
                onToggle();
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option.value && styles.dropdownOptionTextSelected,
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

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Filter states
  const [genre, setGenre] = useState('');
  const [style, setStyle] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [artist, setArtist] = useState('');
  const [label, setLabel] = useState('');

  // Button animation
  const [buttonScale] = useState(new Animated.Value(1));

  // Sample options for dropdowns
  const genreOptions = [
    { label: 'All Genres', value: '' },
    { label: 'Rock', value: 'rock' },
    { label: 'Jazz', value: 'jazz' },
    { label: 'Blues', value: 'blues' },
    { label: 'Classical', value: 'classical' },
    { label: 'Electronic', value: 'electronic' },
    { label: 'Hip Hop', value: 'hiphop' },
    { label: 'Pop', value: 'pop' },
  ];

  const styleOptions = [
    { label: 'All Styles', value: '' },
    { label: 'Vinyl', value: 'vinyl' },
    { label: 'CD', value: 'cd' },
    { label: 'Cassette', value: 'cassette' },
    { label: 'Digital', value: 'digital' },
  ];

  const priceOptions = [
    { label: 'Any', value: '' },
    { label: '$0 - $10', value: '0-10' },
    { label: '$10 - $25', value: '10-25' },
    { label: '$25 - $50', value: '25-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100+', value: '100+' },
  ];

  const yearOptions = Array.from({ length: 60 }, (_, i) => {
    const year = 2024 - i;
    return { label: year.toString(), value: year.toString() };
  });

  const artistOptions = [
    { label: 'Any Artist', value: '' },
    { label: 'The Beatles', value: 'beatles' },
    { label: 'Led Zeppelin', value: 'ledzeppelin' },
    { label: 'Pink Floyd', value: 'pinkfloyd' },
    { label: 'Miles Davis', value: 'milesdavis' },
    { label: 'Bob Dylan', value: 'bobdylan' },
  ];

  const labelOptions = [
    { label: 'Any Label', value: '' },
    { label: 'Capitol Records', value: 'capitol' },
    { label: 'Columbia Records', value: 'columbia' },
    { label: 'Atlantic Records', value: 'atlantic' },
    { label: 'Blue Note', value: 'bluenote' },
    { label: 'Motown', value: 'motown' },
  ];

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Search performed with:', {
        searchQuery,
        genre,
        style,
        minPrice,
        maxPrice,
        yearFrom,
        yearTo,
        artist,
        label,
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Search Records</Text>
          
          {/* Search Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search records..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filters</Text>
            
            <FilterDropdown
              label="Genre"
              value={genreOptions.find(g => g.value === genre)?.label || ''}
              onValueChange={setGenre}
              options={genreOptions}
              isOpen={openDropdown === 'genre'}
              onToggle={() => handleDropdownToggle('genre')}
            />

            <FilterDropdown
              label="Style"
              value={styleOptions.find(s => s.value === style)?.label || ''}
              onValueChange={setStyle}
              options={styleOptions}
              isOpen={openDropdown === 'style'}
              onToggle={() => handleDropdownToggle('style')}
            />

            <View style={styles.priceRangeContainer}>
              <View style={styles.priceRangeItem}>
                <FilterDropdown
                  label="Min Price"
                  value={priceOptions.find(p => p.value === minPrice)?.label || ''}
                  onValueChange={setMinPrice}
                  options={priceOptions}
                  isOpen={openDropdown === 'minPrice'}
                  onToggle={() => handleDropdownToggle('minPrice')}
                />
              </View>
              <View style={styles.priceRangeItem}>
                <FilterDropdown
                  label="Max Price"
                  value={priceOptions.find(p => p.value === maxPrice)?.label || ''}
                  onValueChange={setMaxPrice}
                  options={priceOptions}
                  isOpen={openDropdown === 'maxPrice'}
                  onToggle={() => handleDropdownToggle('maxPrice')}
                />
              </View>
            </View>

            <View style={styles.yearRangeContainer}>
              <View style={styles.yearRangeItem}>
                <FilterDropdown
                  label="Year From"
                  value={yearOptions.find(y => y.value === yearFrom)?.label || ''}
                  onValueChange={setYearFrom}
                  options={[{ label: 'Any', value: '' }, ...yearOptions]}
                  isOpen={openDropdown === 'yearFrom'}
                  onToggle={() => handleDropdownToggle('yearFrom')}
                />
              </View>
              <View style={styles.yearRangeItem}>
                <FilterDropdown
                  label="Year To"
                  value={yearOptions.find(y => y.value === yearTo)?.label || ''}
                  onValueChange={setYearTo}
                  options={[{ label: 'Any', value: '' }, ...yearOptions]}
                  isOpen={openDropdown === 'yearTo'}
                  onToggle={() => handleDropdownToggle('yearTo')}
                />
              </View>
            </View>

            <FilterDropdown
              label="Artist"
              value={artistOptions.find(a => a.value === artist)?.label || ''}
              onValueChange={setArtist}
              options={artistOptions}
              isOpen={openDropdown === 'artist'}
              onToggle={() => handleDropdownToggle('artist')}
            />

            <FilterDropdown
              label="Label"
              value={labelOptions.find(l => l.value === label)?.label || ''}
              onValueChange={setLabel}
              options={labelOptions}
              isOpen={openDropdown === 'label'}
              onToggle={() => handleDropdownToggle('label')}
            />
          </View>

          {/* Search Button */}
          <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D2B48C',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 16,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2B48C',
  },
  filtersContainer: {
    marginBottom: 30,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D2B48C',
    marginBottom: 20,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownHeader: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2B48C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownLabel: {
    color: '#D2B48C',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownValue: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  dropdownArrow: {
    color: '#D2B48C',
    fontSize: 12,
  },
  dropdownContent: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D2B48C',
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownOptionSelected: {
    backgroundColor: '#D2B48C',
  },
  dropdownOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownOptionTextSelected: {
    color: '#000',
    fontWeight: '500',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  priceRangeItem: {
    flex: 1,
  },
  yearRangeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  yearRangeItem: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
  },
  searchButton: {
    backgroundColor: '#D2B48C',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#D2B48C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SearchScreen;