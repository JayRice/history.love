import React from 'react';
import { View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
}) => {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 mr-4">
        <Text variant="bodyLarge" className="text-gray-900 font-medium">
          {label}
        </Text>
        {description && (
          <Text variant="bodySmall" className="text-gray-600 mt-1">
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        thumbColor={value ? colors.primary : colors.surface}
        trackColor={{ 
          false: colors.outline, 
          true: colors.primary + '40' 
        }}
      />
    </View>
  );
};