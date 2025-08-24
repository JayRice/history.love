import { useEffect, useState } from 'react';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '@/src/theme/paperTheme';
import { useAuth } from '@/src/hooks/useAuth';
import { useUserStore } from '@/src/store/userStore';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PaperProvider theme={paperTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}