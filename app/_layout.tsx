import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '@/src/theme/paperTheme';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </AuthProvider>
  );
}