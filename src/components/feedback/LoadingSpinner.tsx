import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large'
}) => {
  const colors = useThemeColors();

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text variant="bodyMedium" className="text-gray-600 mt-4 text-center">
          {message}
        </Text>
      )}
    </View>
  );
};