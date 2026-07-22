import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center px-8">
      {icon && (
        <View className="mb-6">
          {icon}
        </View>
      )}
      
      <Text variant="headlineSmall" className="text-gray-900 text-center mb-3 font-semibold">
        {title}
      </Text>
      
      <Text variant="bodyLarge" className="text-gray-600 text-center mb-8 leading-6">
        {description}
      </Text>
      
      {actionText && onAction && (
        <PrimaryButton
          onPress={onAction}
          size="large"
        >
          {actionText}
        </PrimaryButton>
      )}
    </View>
  );
};