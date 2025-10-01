// components/location/LocationSearchModal.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { X as XIcon, MapPin as MapPinIcon, Search as SearchIcon } from 'lucide-react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { GeoLocation } from '@/src/types/GeoLocation';
import { TextInput } from 'react-native-paper';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { LoadingSpinner } from "@/src/components/feedback/LoadingSpinner"

type LocationSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (loc: GeoLocation) => void;
  initialQuery?: string;
  // Optional: override fetcher for tests or different providers
  fetchLocations?: (query: string) => Promise<GeoLocation[]>;
};

const defaultFetch = async (query: string): Promise<GeoLocation[]> => {
  if (!query?.trim()) return [];
  // OpenStreetMap Nominatim (no key). Respect their usage policy in production (email UA, proper throttling).
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(
    query.trim()
  )}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      // In production, set a descriptive UA string with contact per Nominatim policy.
      'User-Agent': 'history.love/1.0 (contact: app@example.com)',
    },
  });
  if (!res.ok) return [];
  const json: any[] = await res.json();
  console.log("fetchLocations", json);
  return json.map((item) => {
    const addr = item.address ?? {};
    const pieces = [
      addr.city || addr.town || addr.village || addr.hamlet || addr.municipality,
      addr.state || addr.region || addr.county,
      addr.country_code ? String(addr.country_code).toUpperCase() : addr.country,
    ].filter(Boolean);
    console.log("pieces = ", pieces);
    const label = pieces.join(', ') || item.display_name || query;
    return {
      id: String(item.place_id),
      label,
      latitude: item.lat ? Number(item.lat) : undefined,
      longitude: item.lon ? Number(item.lon) : undefined,
      city: addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || null,
      state: addr.state || addr.region || addr.county || null,
      country: addr.country || null,
      countryCode: addr.countryCode || null,
    } as GeoLocation;
  });
};

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
                                                                          visible,
                                                                          onClose,
                                                                          onSelect,
                                                                          initialQuery = '',
                                                                          fetchLocations = defaultFetch,
                                                                        }) => {
  const colors = useThemeColors();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const debouncer = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    if (!visible) return;
    setQuery(initialQuery);
    setTouched(false);
  }, [visible, initialQuery]);

  const runSearch = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const list = await fetchLocations(q);
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchLocations]
  );

  useEffect(() => {
    if (!visible) return;
    if (debouncer.current) clearTimeout(debouncer.current);
    debouncer.current = setTimeout(() => {
      runSearch(query);
    }, 300);
    return () => {
      if (debouncer.current) clearTimeout(debouncer.current);
    };
  }, [query, visible, runSearch]);

  const echoedFirst: GeoLocation | null = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return {
      id: `raw::${q.toLowerCase()}`,
      label: q, // exact echo
      rawQuery: q,
    };
  }, [query]);

  const data = useMemo(() => {
    const list = [...results];
    // If echo equals first real result label, avoid duplication
    if (echoedFirst && (!list.length || list[0].label.toLowerCase() !== echoedFirst.label.toLowerCase())) {
      return [echoedFirst, ...list];
    }
    return list;
  }, [results, echoedFirst]);

  const renderItem = ({ item }: { item: GeoLocation }) => (
    <Pressable
      onPress={() => onSelect(item)}
      style={({ pressed }) => [
        styles.resultRow,
        {
          backgroundColor: pressed ? colors.surfaceVariant : colors.surface,
          borderBottomColor: colors.outlineVariant,
        },
      ]}
    >
      <MapPinIcon size={18} color={colors.primary} />
      <Text numberOfLines={1} style={[styles.resultText, { color: colors.onSurface }]}>
        {item.label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.full, { backgroundColor: colors.backdrop?.concat('66') ?? '#00000066' }]}
      >
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View className={"flex  "} style={[styles.topBar, { borderBottomColor: colors.outlineVariant }]}>


            <View className={"flex-0"} style={[styles.searchWrap, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
              <SearchIcon size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={query}
                onChangeText={(t) => {
                  if (!touched) setTouched(true);
                  setQuery(t);
                }}
                placeholder="Search city"
                mode="flat"
                dense
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                style={{ flex: 1, backgroundColor: 'transparent' }}
                theme={{ colors: { onSurfaceVariant: colors.onSurfaceVariant } } as any}
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => runSearch(query)}
              />
            </View>
            <PrimaryButton className={"flex-1"}
              variant="text"
              onPress={onClose}
              labelStyle={{ fontWeight: '600' }}
              style={{ paddingHorizontal: 8, minWidth: 80, alignSelf: 'flex-start' }}
            >
              Cancel
            </PrimaryButton>
          </View>

          {loading ? (
            <View style={[styles.loadingWrap, { backgroundColor: colors.surface }]}>
              <LoadingSpinner />
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  full: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  topBar: {
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  searchWrap: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingWrap: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  resultRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultText: { fontSize: 16, flexShrink: 1 },
});
