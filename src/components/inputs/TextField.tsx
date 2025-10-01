import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { TextInput, TextInputProps, Text } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface TextFieldProps extends Omit<TextInputProps, 'mode'> {
  variant?: 'outlined' | 'flat';
  maxLength?: number; // optional prop
  value?: string;
  showMax?: boolean;
}

export const TextField = forwardRef<any, TextFieldProps>(
  ({ variant = 'outlined', style, maxLength, value, showMax=false, ...props }, ref) => {
    const colors = useThemeColors()

    const inputStyle = [
      {
        backgroundColor:
          variant === 'flat' ? colors.surfaceVariant : colors.surface,
        borderRadius: 12,
      },
      style,
    ];

    return (
      <View>
        <TextInput
          ref={ref}
          mode={variant}
          style={inputStyle}
          activeOutlineColor={colors.primary}
          outlineColor={colors.outline}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {(showMax && maxLength) && (
          <Text style={{color: value?.length ?? 0 <= maxLength ? colors.onSurface:colors.error}} className="ml-1 mt-1 text-xs">
            {`${value?.length ?? 0}/${maxLength}`}
          </Text>
        )}
      </View>
    );
  }
);

TextField.displayName = 'TextField';
