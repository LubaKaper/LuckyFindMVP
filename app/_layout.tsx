import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import sophisticatedTheme from '@/styles/sophisticatedTheme';

const { colors } = sophisticatedTheme;

// Create custom navigation theme matching our sophisticated design
const SophisticatedNavigationTheme = {
  dark: false,
  colors: {
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={SophisticatedNavigationTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '600',
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Modal',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
          }} 
        />
      </Stack>
      <StatusBar style="light" backgroundColor={colors.background} />
    </ThemeProvider>
  );
}
