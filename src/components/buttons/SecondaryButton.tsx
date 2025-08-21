import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface SecondaryButtonProps extends Omit<ButtonProps, 'mode'> {
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  variant = 'outlined',
  size = 'medium',
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
      fontWeight: '500' as const,
    },
    labelStyle,
  ];

  return (
    <Button
      mode={variant === 'filled' ? 'contained' : variant === 'outlined' ? 'outlined' : 'text'}
      buttonColor={variant === 'filled' ? colors.secondary : undefined}
      textColor={variant === 'filled' ? colors.onSecondary : colors.secondary}
      style={buttonStyle}
      labelStyle={textStyle}
      {...props}
    />
  );
};