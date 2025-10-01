


// components/location/LocationPicker.tsx
import React, { useMemo, useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MapPin as MapPinIcon } from 'lucide-react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { GeoLocation } from '@/src/types/GeoLocation';
import { LocationSearchModal } from '@/src/components/modals/LocationSearchModal';
import { useLocationModalStore } from '@/src/store/useLocationModalStore';
import { router } from 'expo-router';

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



  const open = useLocationModalStore(s => s.open)

  const handleOpenLocationSearch = async () => {
    console.log("in location search modal")

    router.push("/(modals)/location_search")
    const picked = await open();           // waits until modal resolves
    if (picked) onChange(picked);
  };

  const caption = useMemo(() => {
    if (!value) return placeholder;
    return value.label || placeholder;
  }, [value, placeholder]);

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
