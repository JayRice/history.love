import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightElement,
}) => {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View className="flex-1">
        <Text variant="headlineSmall" className="text-gray-900 font-semibold">
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodyMedium" className="text-gray-600 mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && (
        <View className="ml-3">
          {rightElement}
        </View>
      )}
    </View>
  );
};