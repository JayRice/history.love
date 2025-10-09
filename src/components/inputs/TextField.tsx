import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { TextInput, TextInputProps, Text } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface TextFieldProps extends Omit<TextInputProps, 'mode'> {
  variant?: 'outlined' | 'flat';
  optional?: boolean;
  maxLength?: number; // optional prop
  value?: string;
  showMax?: boolean;
  textArea?: boolean;
}

export const TextField = forwardRef<any, TextFieldProps>(
  ({ variant = 'outlined', style, maxLength, value, showMax=false, textArea=false, optional=false, ...props }, ref) => {
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
          style={{...inputStyle, minHeight: textArea ? 120:0}}
          activeOutlineColor={colors.primary}
          outlineColor={colors.outline}
          value={value}
          maxLength={maxLength}
          numberOfLines={textArea ? 4:1}
          textAlignVertical="top"
          returnKeyType={textArea ? "default":"none"}
          blurOnSubmit={false}
          {...props}
        />
        <View className={"flex flex-row gap-2"}>
          {(showMax && maxLength) && (
            <Text style={{color: value?.length ?? 0 <= maxLength ? colors.onSurface:colors.error}} className="ml-1 mt-1 text-xs">
              {`${value?.length ?? 0}/${maxLength}`}
            </Text>
          )}
          {optional && (
            <Text variant={"bodySmall"} className={"font-light"}>(Optional)</Text>
          )}
        </View>

      </View>
    );
  }
);

TextField.displayName = 'TextField';
