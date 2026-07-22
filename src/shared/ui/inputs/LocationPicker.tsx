


// components/location/LocationPicker.tsx
import React, { useMemo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MapPin as MapPinIcon, X as XIcon } from 'lucide-react-native';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { GeoLocation } from '@/src/shared/types/GeoLocation';
import { useModal } from '@/src/shared/ui/ModalContext';

type LocationPickerProps = {
  value: GeoLocation | null;
  onChange: (loc: GeoLocation | null) => void;
  label?: string;
  placeholder?: string; // default: "Select a location"
  disabled?: boolean;
  error?: string;
};



export const LocationPicker: React.FC<LocationPickerProps> = ({
                                                                value,
                                                                onChange,
                                                                label = 'Location',
                                                                placeholder = 'Select a location',
                                                                disabled = false,
                                                                error,
                                                              }) => {
  const colors = useThemeColors();



  const { openModal } = useModal();


  const handleOpenLocationSearch = async () => {
    const loc = await openModal<GeoLocation>('location_search');
    if (loc) onChange(loc);
  };

  const caption = useMemo(() => {
    if (!value) return placeholder;
    return value.label || placeholder;
  }, [value, placeholder]);

  const clear = () => {
    onChange(null)
  }

  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.onSurfaceVariant, fontWeight: '600' }}>{label}</Text>

        <Pressable
          disabled={disabled}
          onPress={() => handleOpenLocationSearch()}
          style={({ pressed }) => [
            styles.box,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.outline,
              opacity: disabled ? 0.6 : 1,
            },
            pressed && { borderColor: colors.primary },
          ]}
        >
          <MapPinIcon size={18} color={value ? colors.primary : colors.onSurfaceVariant} />
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                color: value ? colors.onSurface : colors.onSurfaceVariant,
                opacity: value ? 1 : 0.7, // “dimly in its background”
              }}
            >
                {caption}
            </Text>
          </View>
          {(value && (
             <XIcon onPress={clear} size={18} color={colors.onSurfaceVariant} />
          ))}
        </Pressable>

        {!!error && (
          <Text style={{ color: colors.error, fontSize: 12 }}>
            {error}
          </Text>
        )}
      </View>


    </>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 6,

    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});
