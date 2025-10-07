# LuckyFind MVP - Record Search App

A React Native application built with Expo for searching vinyl records with advanced filtering capabilities.

## Features

### UI Design
- **Dark Theme**: Black background (#000000) with sand yellow (#D2B48C) accents
- **Modern Design**: Clean, minimal interface with smooth animations
- **Responsive Layout**: Flexbox-based layout with proper spacing

### Search Functionality
- **Text Search**: Main search input for record queries
- **Advanced Filters**:
  - Genre selection (Rock, Jazz, Blues, Classical, etc.)
  - Style/Format (Vinyl, CD, Cassette, Digital)
  - Price range (Min/Max price filters)
  - Year range (From/To year selection)
  - Artist selection
  - Label selection

### Interactive Components
- **Animated Dropdowns**: Smooth open/close animations
- **Button Animations**: Press feedback with scaling effects
- **Loading States**: ActivityIndicator during search operations
- **Responsive Touch**: Optimized for mobile interaction

## Component Structure

```
components/
└── SearchScreen.tsx          # Main search interface
    ├── FilterDropdown        # Custom animated dropdown component
    └── Search functionality  # Handles search logic and state
```

## Design Specifications

### Color Palette
- **Primary Background**: #000000 (Black)
- **Accent Color**: #D2B48C (Sand Yellow)
- **Secondary Background**: #1a1a1a (Dark Gray)
- **Text Colors**: 
  - Primary: #FFFFFF (White)
  - Accent: #D2B48C (Sand Yellow)
  - Secondary: #666666 (Gray)

### Typography
- **Title**: 28px, Bold, Sand Yellow
- **Section Headers**: 20px, Semi-bold, Sand Yellow
- **Body Text**: 16px, Regular, White
- **Labels**: 14px, Medium, Sand Yellow

### Spacing & Layout
- **Container Padding**: 20px
- **Component Margins**: 15px between filters
- **Input Padding**: 15px
- **Button Padding**: 18px
- **Border Radius**: 10px for all components

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Run on Device**:
   - Scan QR code with Expo Go (mobile)
   - Press 'w' for web browser
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Hooks (useState)
- **Animations**: React Native Animated API
- **Styling**: StyleSheet API
- **Development**: TypeScript

## Animations

### Dropdown Animations
- **Open/Close**: Height animation (0-150px) over 300ms
- **Arrow Rotation**: 180-degree rotation for visual feedback

### Button Animations
- **Press Effect**: Scale animation (1.0 → 0.95 → 1.0) over 200ms
- **Loading State**: ActivityIndicator with smooth transitions

## Future Enhancements

- [ ] Search results display
- [ ] Favorites/Wishlist functionality
- [ ] User authentication
- [ ] Real API integration
- [ ] Advanced sorting options
- [ ] Image galleries for records
- [ ] Social sharing features
- [ ] Offline mode support

## File Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation layout
│   ├── index.tsx            # Main search screen (Home tab)
│   └── explore.tsx          # Explore tab
├── _layout.tsx              # Root layout
└── modal.tsx                # Modal screens

components/
├── SearchScreen.tsx         # Main search component
└── ui/                      # Reusable UI components

constants/
└── theme.ts                 # App theme and colors
```

## Performance Considerations

- **Optimized Animations**: Using `useNativeDriver` where possible
- **Efficient Rendering**: Proper key props for list items
- **Memory Management**: Cleanup of animation listeners
- **Smooth Scrolling**: Optimized ScrollView performance

## Accessibility

- **Touch Targets**: Minimum 44px touch areas
- **Color Contrast**: High contrast between text and backgrounds
- **Screen Readers**: Proper labeling for form elements
- **Keyboard Navigation**: Focus management for inputs
