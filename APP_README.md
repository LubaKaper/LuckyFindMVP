# LuckyFind MVP - Record Search App

A React Native application built with Expo for searching vinyl records with advanced filtering capabilities.

## Project Architecture

This project follows a modular, component-based architecture with clear separation of concerns:

### 📁 **File Structure**
```
LuckyFindMVP/
├── screens/                 # Main screen components
│   ├── SearchScreen.js      # Main search interface
│   └── index.js            # Screen exports
├── components/              # Reusable UI components  
│   ├── Button.js           # Customizable button component
│   ├── Input.js            # Text input with validation
│   ├── Dropdown.js         # Animated dropdown selector
│   └── index.js            # Component exports
├── api/                    # API integration layer
│   └── discogs.js          # Discogs API client
├── styles/                 # Design system
│   └── theme.js            # Colors, typography, spacing
├── app/(tabs)/             # Expo Router navigation
│   ├── index.tsx           # Home tab (Search)
│   ├── explore.tsx         # Explore tab
│   └── _layout.tsx         # Tab layout configuration
└── constants/              # App constants
    └── theme.ts            # Legacy theme (being replaced)
```

### 🏗️ **Architecture Principles**

#### **Modular Component Design**
- **Reusable Components**: Button, Input, Dropdown can be used throughout the app
- **Props-Based Configuration**: Components accept props for customization
- **Consistent Styling**: All components use the centralized theme system
- **Clear Interfaces**: Well-defined prop types and documentation

#### **Separation of Concerns**
- **UI Layer**: Components handle presentation and user interaction
- **Business Logic**: Screens manage state and coordinate between components
- **Data Layer**: API module handles all external data fetching
- **Design System**: Theme module centralizes all design tokens

#### **State Management**
- **React Hooks**: `useState` and `useEffect` for local component state
- **Functional Components**: Modern React patterns throughout
- **Immutable Updates**: Proper state update patterns
- **Lifecycle Management**: Proper cleanup and effect dependencies

## 🎨 **Design System**

### **Theme Structure** (`styles/theme.js`)
```javascript
// Centralized design tokens
export const colors = { /* Color palette */ }
export const typography = { /* Font system */ }
export const spacing = { /* Spacing scale */ }
export const borderRadius = { /* Border radius values */ }
export const shadows = { /* Shadow configurations */ }
export const animations = { /* Animation durations */ }
export const commonStyles = { /* Reusable styles */ }
```

### **Color Palette**
- **Primary**: #D2B48C (Sand Yellow) - Buttons, accents, highlights
- **Background**: #000000 (Black) - Main background
- **Secondary**: #1a1a1a (Dark Gray) - Cards, inputs
- **Text**: #FFFFFF (White) - Primary text
- **Accent**: #D2B48C (Sand Yellow) - Labels, borders

### **Typography Scale**
- **Sizes**: xs(12), sm(14), base(16), lg(18), xl(20), xxl(24), xxxl(28)
- **Weights**: normal(400), medium(500), semiBold(600), bold(700)
- **Line Heights**: tight(1.2), normal(1.4), relaxed(1.6)

### **Spacing System** (4px grid)
- **Values**: xs(4), sm(8), md(12), base(16), lg(20), xl(24), xxl(32), xxxl(40)

## 🔧 **Component Architecture**

### **Button Component** (`components/Button.js`)
```javascript
// Flexible button with multiple variants
<Button 
  title="Search Records"
  onPress={handleSearch}
  variant="primary"     // primary, secondary, outline, ghost
  size="medium"         // small, medium, large  
  loading={isLoading}   // Shows loading spinner
  disabled={false}      // Disables interaction
/>
```

### **Input Component** (`components/Input.js`)
```javascript
// Text input with validation and styling
<Input
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search records..."
  label="Search Query"    // Optional label
  error={errorMessage}    // Error state styling
  disabled={false}        // Disabled state
/>
```

### **Dropdown Component** (`components/Dropdown.js`)
```javascript
// Animated dropdown with options
<Dropdown
  label="Genre"
  value={selectedGenre}
  onValueChange={setGenre}
  options={genreOptions}   // Array of {label, value}
  isOpen={isDropdownOpen}
  onToggle={toggleDropdown}
  placeholder="Select..."
/>
```

## 🔌 **API Integration**

### **Discogs API Client** (`api/discogs.js`)
```javascript
// Main search function
import { advancedSearch } from '../api/discogs';

const results = await advancedSearch({
  searchQuery: 'Abbey Road',
  genre: 'rock',
  artist: 'beatles',
  yearFrom: '1960',
  yearTo: '1970'
});
```

### **API Functions**
- `searchRecords()` - Basic search functionality
- `advancedSearch()` - Multi-filter search
- `getReleaseDetails()` - Detailed record information
- `getArtistInfo()` - Artist information
- `getLabelInfo()` - Label information
- `getSuggestions()` - Autocomplete suggestions

### **Mock Data Support**
- Development-ready mock responses
- Simulated API delays for realistic testing
- Easy switch to real API when ready

## 🎯 **Features**

### **Search Functionality**
- **Text Search**: Main query input with search-as-you-type
- **Advanced Filters**: 
  - Genre (Rock, Jazz, Blues, Classical, etc.)
  - Format (Vinyl, CD, Cassette, Digital)
  - Price Range (Min/Max price filtering)
  - Year Range (From/To year selection)
  - Artist selection with popular options
  - Record Label filtering

### **User Experience**
- **Animated Interactions**: Smooth dropdown animations (300ms)
- **Press Feedback**: Button scale animations (100ms)
- **Loading States**: ActivityIndicator during API calls
- **Form Validation**: Error states and user feedback
- **Keyboard Handling**: Proper keyboard dismiss and navigation

### **Responsive Design**
- **Mobile-First**: Optimized for mobile interaction
- **Touch Targets**: Minimum 48px for accessibility
- **Flexible Layout**: Adapts to different screen sizes
- **Smooth Scrolling**: Optimized ScrollView performance

## 🚀 **Getting Started**

### **Installation**
```bash
# Clone repository
git clone [repository-url]
cd LuckyFindMVP

# Install dependencies
npm install

# Start development server
npm start
```

### **Development Commands**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator  
npm run web        # Run in web browser
npm run lint       # Run ESLint
```

### **Development Workflow**
1. **Component Development**: Create reusable components in `/components`
2. **Screen Development**: Build screens in `/screens` using components
3. **API Integration**: Add API functions to `/api` modules
4. **Styling**: Update theme tokens in `/styles/theme.js`
5. **Testing**: Test on web, iOS, and Android platforms

## 📱 **Technology Stack**

- **Framework**: React Native 0.81.4 with Expo ~54.0.12
- **Navigation**: Expo Router ~6.0.10
- **State Management**: React Hooks (useState, useEffect)
- **Animations**: React Native Animated API
- **Styling**: StyleSheet with centralized theme system
- **Development**: JavaScript with JSDoc comments
- **API**: Fetch with async/await patterns
- **Testing**: Expo Go for device testing

## 🔄 **Development Patterns**

### **Component Naming**
- **PascalCase** for components: `SearchScreen`, `Button`, `Dropdown`
- **camelCase** for variables and functions: `searchQuery`, `handleSearch`
- **kebab-case** for file names: `search-screen.js` (if preferred)

### **State Management Patterns**
```javascript
// Centralized state for complex screens
const [filters, setFilters] = useState({
  genre: '',
  style: '',
  yearFrom: '',
  yearTo: ''
});

// Individual state updates
const updateFilter = (filterName, value) => {
  setFilters(prevFilters => ({
    ...prevFilters,
    [filterName]: value
  }));
};
```

### **Error Handling**
```javascript
try {
  setIsLoading(true);
  const results = await advancedSearch(searchParams);
  setSearchResults(results);
} catch (error) {
  console.error('Search failed:', error.message);
  Alert.alert('Error', 'Search failed. Please try again.');
} finally {
  setIsLoading(false);
}
```

## 🎨 **Styling Patterns**

### **Using Theme System**
```javascript
import { colors, typography, spacing } from '../styles/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    color: colors.textAccent,
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  }
});
```

### **Component Styling**
```javascript
// Base styles from theme
const styles = StyleSheet.create({
  button: {
    ...commonStyles.button,  // Use theme base styles
    // Override specific properties
    backgroundColor: colors.primary,
  }
});
```

## 🔮 **Future Enhancements**

### **Phase 2 Features**
- [ ] Search results display with card layout
- [ ] Infinite scroll pagination
- [ ] Image galleries and detail views
- [ ] Real-time search suggestions

### **Phase 3 Features**
- [ ] User authentication and profiles
- [ ] Favorites and wishlist functionality
- [ ] Price tracking and alerts
- [ ] Social sharing and reviews

### **Technical Improvements**
- [ ] TypeScript migration for better type safety
- [ ] React Query for advanced data fetching
- [ ] Redux Toolkit for complex state management
- [ ] Automated testing with Jest and Testing Library

## 📚 **Documentation Standards**

- **JSDoc Comments**: All functions documented with parameters and return values
- **Component Props**: Clear prop documentation with types and defaults
- **API Functions**: Comprehensive parameter and response documentation
- **Architecture Decisions**: Documented reasoning for structural choices

This architecture provides a solid foundation for scaling the application while maintaining code quality, reusability, and developer experience.
