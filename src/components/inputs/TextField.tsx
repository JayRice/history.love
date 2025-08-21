import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface TextFieldProps extends Omit<TextInputProps, 'mode'> {
  variant?: 'outlined' | 'flat';
}

export const TextField = forwardRef<any, TextFieldProps>(({
  variant = 'outlined',
  style,
  ...props
}, ref) => {
  const colors = useThemeColors();

  const inputStyle = [
    {
      backgroundColor: variant === 'flat' ? colors.surfaceVariant : colors.surface,
      borderRadius: 12,
    },
    style,
  ];

  return (
    <TextInput
      ref={ref}
      mode={variant}
      style={inputStyle}
      activeOutlineColor={colors.primary}
      outlineColor={colors.outline}
      {...props}
    />
  );
});

TextField.displayName = 'TextField';