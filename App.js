/**
 * Main App Component with Navigation Stack
 * 
 * Sets up React Navigation with stack navigator for the vinyl record search app.
 * Includes screens for search, results, and record details with smooth transitions.
 * 
 * Features:
 * - Stack navigation between screens
 * - Chartreuse accent color theme
 * - Dark background theme
 * - Smooth transitions and gestures
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SearchScreen from './screens/SearchScreen';
import SearchResultsScreen from './screens/SearchResultsScreen';
import RecordDetailScreen from './screens/RecordDetailScreen';

// Import theme colors
import { colors } from './styles/theme';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.backgroundSecondary,
          text: colors.text,
          border: colors.borderSecondary,
          notification: colors.accent,
        },
      }}
    >
      <StatusBar style="light" backgroundColor={colors.background} />
      
      <Stack.Navigator
        initialRouteName="Search"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {/* Search Screen */}
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'LuckyFind',
            headerShown: false, // Custom header in component
          }}
        />

        {/* Search Results Screen */}
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{
            title: 'Search Results',
            headerShown: false, // Custom header in component
            gestureEnabled: true,
          }}
        />

        {/* Record Detail Screen */}
        <Stack.Screen
          name="RecordDetail"
          component={RecordDetailScreen}
          options={{
            title: 'Record Details',
            headerShown: false, // Custom header in component
            gestureEnabled: true,
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;