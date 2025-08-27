import React from 'react';
import { Button, ButtonProps, Text } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { View } from 'react-native';

interface PrimaryButtonProps extends Omit<ButtonProps, 'mode'> {
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  error?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  error = "",
  style,
  labelStyle,
  ...props
}) => {
  const colors = useThemeColors();
  
  const buttonStyle = [
    {
      borderRadius: 12,
    },
    size === 'small' && { paddingVertical: 4 },
    size === 'large' && { paddingVertical: 8 },
    style,
  ];

  const textStyle = [
    {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600' as const,
    },
    labelStyle,
  ];

  return (
    <View className={"flex flex-col gap-2"}>
      <Button
        mode={variant === 'filled' ? 'contained' : variant === 'outlined' ? 'outlined' : 'text'}
        buttonColor={variant === 'filled' ? colors.primary : undefined}
        textColor={variant === 'filled' ? colors.onPrimary : colors.primary}
        style={buttonStyle}
        labelStyle={textStyle}
        {...props}
      />
      {error!="" && <Text style={{ color: colors.error }} className={" mb-8 "}>{error}</Text>}
    </View>

  );
};