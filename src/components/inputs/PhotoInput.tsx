// PhotoInput.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { View, Image, Pressable, FlatList, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from 'react-native-paper';
import { Image as ImageIcon, X as XIcon } from 'lucide-react-native'; // yarn add lucide-react-native
import { useThemeColors } from '@/src/hooks/useThemeColors';

// Your PrimaryButton signature (already in your codebase)
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';

import Photo from "../../types/Photo"
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import { useJpegCompressor } from '@/src/hooks/useJpegCompressor';

type PhotoInputProps = {
  photos: Photo[];
  setPhotos: (next: Photo[]) => void;
  maxPhotos?: number; // default = unlimited
  minPhotos?: number;
  title?: string;
  // If true, when picking "Change photos" replaces the whole list; otherwise it appends (respecting max)
  replaceOnChange?: boolean;
  displayPhotos?: Photo[];
  onDelete?: (photo: Photo) => void;
};

export const PhotoInput: React.FC<PhotoInputProps> = ({
                                                        photos,
                                                        setPhotos,
                                                        maxPhotos,
                                                        minPhotos=1,
                                                        title = 'Photos',
                                                        replaceOnChange = true,
                                                        displayPhotos = [],
                                                        onDelete = () => {},


                                                      }) => {
  const colors = useThemeColors();

  const [loading, setLoading ] = useState<boolean>(false);

  const { compressManyPhotos } = useJpegCompressor({ maxBytes: 5 * 1024 * 1024 });


  const remaining = useMemo(() => {
    if (typeof maxPhotos !== 'number') return Number.MAX_SAFE_INTEGER;
    return Math.max(0, maxPhotos - (photos.length + displayPhotos.length || 0));
  }, [maxPhotos, photos.length, displayPhotos.length]);

  const requestMediaPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }, []);

  const mapAssets = (assets: ImagePicker.ImagePickerAsset[]): Photo[] =>
    assets.map(a => ({
      uri: a.uri,
      width: a.width ?? 0,
      height: a.height ?? 0,
      type: a.type ?? 'image',
    }));

  const pickImages = useCallback(
    async (mode: 'append' | 'replace') => {
      const ok = await requestMediaPermission();
      if (!ok) {
        // You can swap this for your toast/snackbar system
        console.warn('Permission to access photos was denied.');
        return;
      }

      const selectionLimit =
        mode === 'replace'
          ? (typeof maxPhotos === 'number' ? maxPhotos : 0) || 0 // 0 means "platform default unlimited"
          : (remaining === Number.MAX_SAFE_INTEGER ? 0 : remaining);

      setLoading(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
        allowsMultipleSelection: true,
        selectionLimit, // 0 = no explicit cap (platform default). On iOS 14+, Android recent Expo SDKs this is supported.
      });

      if (result.canceled) return setLoading(false);

      const selected = mapAssets(result.assets ?? []);

      const converted = await compressManyPhotos(selected);



      if (mode === 'replace' || replaceOnChange) {
        const next = typeof maxPhotos === 'number' ? selected.slice(0, maxPhotos) : converted;
        setPhotos(next);
      } else {
        const merged = [...photos, ...converted];

        // Deduplicate by uri
        const uniqueByUri = Array.from(new Map(merged.map(p => [p.uri, p])).values());
        const capped = typeof maxPhotos === 'number' ? uniqueByUri.slice(0, maxPhotos) : uniqueByUri;

        setPhotos(capped);
      }
      setLoading(false);
    },
    [maxPhotos, photos, remaining, replaceOnChange, requestMediaPermission, setPhotos, displayPhotos]
  );

  const removeAt = useCallback(
    (idx: number) => {
      const next = [...photos];
      next.splice(idx, 1);
      setPhotos(next);
    },
    [photos, setPhotos, displayPhotos]
  );

  const reachedMax = typeof maxPhotos === 'number' && photos.length >= maxPhotos;

  const reachedMin = useMemo(() => {
    return typeof minPhotos === "number" && (photos.length + displayPhotos.length) === minPhotos;
  }, [photos.length, displayPhotos.length])

  return (
    <View style={[styles.container, { borderColor: colors.outline }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>

        {/* "Add photos" — link-style (variant="text") with a photo icon */}
        <PrimaryButton
          variant="text"
          disabled={reachedMax}
          onPress={() => pickImages('append')}
          icon={
            // lucide icon as RN element
            (iconProps) => <ImageIcon size={18} color={reachedMax ? colors.onSurfaceVariant : colors.primary} />
          }
          labelStyle={{ textDecorationLine: 'underline' }}
        >
          {reachedMax ? 'Max reached' : 'Add photos'}
        </PrimaryButton>
      </View>

      {/* Preview area */}
      <View
        style={[
          styles.previewBox,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        { loading ?  <LoadingSpinner /> : (photos.length === 0 && displayPhotos.length === 0 ) ? (
           <View style={styles.emptyState}>
            <ImageIcon size={28} color={colors.onSurfaceVariant} />
            <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>
              No photos yet. Tap “Add photos”.
            </Text>
          </View>
        ) : (
          <FlatList
            data={[...displayPhotos, ...photos]}
            keyExtractor={(item, index) => item?.uri ?? String(index)}
            numColumns={3}
            contentContainerStyle={{ gap: 8 }}
            columnWrapperStyle={{ gap: 8 }}
            renderItem={({ item, index }) => {

              const isDisplayPhoto = displayPhotos.filter((photo) => photo.name === item?.name).length > 0;
              return (
                <View style={[styles.thumbWrap, { backgroundColor: colors.surface }]}>
                  <Image
                    source={{ uri: item.uri }}
                    style={[styles.thumb,
                      isDisplayPhoto ? {borderColor: colors.primary, borderWidth: 6 }:{}
                    ]}
                    resizeMode="cover"
                  />
                  {!reachedMin && <Pressable
                    onPress={() => {
                      onDelete(item);
                      removeAt(index)

                    }}
                    style={[
                      styles.removeBtn,
                      { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                    ]}
                    android_ripple={{ borderless: true }}
                  >
                    <XIcon size={14} color={colors.onSurface} />
                  </Pressable>}
                </View>
              )
            }
            }
          />
        )}
      </View>

      {/* Footer actions: "Change images" */}
      <View style={styles.footerRow}>
        <PrimaryButton
          variant="outlined"
          onPress={() => pickImages('replace')}
          style={{ flex: 1 }}
        >
          {photos.length ? 'Change photos' : 'Pick photos'}
        </PrimaryButton>
      </View>

      {/* Helper text: remaining counter if max provided */}
      {typeof maxPhotos === 'number' && (
        <Text style={{ marginTop: 8, color: colors.onSurfaceVariant }}>
          {maxPhotos - remaining}/{maxPhotos} selected
        </Text>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '600' },
  previewBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    minHeight: 140,
  },
  emptyState: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbWrap: {
    position: 'relative',
    width: '31%', // with gap: 8 and 3 columns, this fits nicely
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footerRow: { flexDirection: 'row', gap: 12 },
});
