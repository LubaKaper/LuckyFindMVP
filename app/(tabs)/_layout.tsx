import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { SearchRecordIcon, VinylRecordIcon } from '@/components/SophisticatedIcons';
import sophisticatedTheme from '@/styles/sophisticatedTheme';

const { colors, spacing, typography } = sophisticatedTheme;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,        // Coral for active text/icons
        tabBarInactiveTintColor: colors.text,        // Light blue for inactive text/icons  
        tabBarStyle: {
          backgroundColor: colors.background,         // Navy background
          borderTopColor: colors.border,              // Sophisticated border
          borderTopWidth: 1,                          // Subtle border
          paddingVertical: spacing.sm,                // Sophisticated spacing
          height: 88,                                 // Standard tab bar height
          shadowColor: colors.background,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: '600' as const,
          marginTop: 2,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <SearchRecordIcon size={28} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <VinylRecordIcon size={28} animated={focused} />,
        }}
      />
    </Tabs>
  );
}
