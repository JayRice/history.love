import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <LoadingSpinner />
    </View>
  );
}