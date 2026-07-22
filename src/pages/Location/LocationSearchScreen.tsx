// components/location/LocationSearchModal.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Text , TextInput } from 'react-native-paper';
import { MapPin as MapPinIcon, Search as SearchIcon } from 'lucide-react-native';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { GeoLocation } from '@/src/shared/types/GeoLocation';

import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import { LoadingSpinner } from "@/src/shared/ui/feedback/LoadingSpinner"
import fetchLocations from '@/src/server/fetchLocations';

import { BackButton } from '@/src/shared/ui/buttons/BackButton';
import { useModal } from '@/src/shared/ui/ModalContext';
import { Screen } from '@/src/shared/ui/layout/Screen';

type LocationSearchScreenProps = {
  initialQuery?: string;
};


export const LocationSearchScreen: React.FC<LocationSearchScreenProps> = ({
                                                                          initialQuery = ''
                                                                        }) => {
  const colors = useThemeColors();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const debouncer = useRef<ReturnType<typeof setTimeout> | null>(null);


  const { closeModal, modals } = useModal();
  const currentModal = modals[modals.length - 1];


  const onPressLocation = (location: GeoLocation | null) => {
    closeModal(currentModal.id, location)
  }

  const runSearch = useCallback(
    async (q: string) => {

      setLoading(true);
      try {
        const list = await fetchLocations(q);
        if (list){
          setResults(list);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchLocations]
  );

  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([])
      return;
    }
    if (debouncer.current) clearTimeout(debouncer.current);
    debouncer.current = setTimeout(() => {
      runSearch(query);
    }, 300);
    return () => {
      if (debouncer.current) clearTimeout(debouncer.current);
    };
  }, [query, runSearch]);

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



  return (
    <Screen className={"pt-8"} padding={false} safeArea={false} >
      <KeyboardAvoidingView
        className={"h-full"}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.full, { backgroundColor: colors.surfaceVariant }]}
      >
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View className={"flex"} style={[styles.topBar, { borderBottomColor: colors.outlineVariant }]}>


            <View className={"flex flex-row items-center justify-center "}>
              <View className={"w-3/4"} style={[styles.searchWrap, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
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
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    color: colors.onSurfaceVariant, // make sure text is visible
                  }}
                  cursorColor={colors.primary}
                  theme={{
                    colors: {
                      onSurfaceVariant: colors.onSurfaceVariant,
                      text: colors.onSurfaceVariant,
                      primary: colors.primary,
                    },
                  } as any}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={() => runSearch(query)}
                />

              </View>
              <BackButton  addedClasses={"relative top-2 left-0 "}></BackButton>


            </View>
            <PrimaryButton className={"flex-1"}
                           variant="text"
                           onPress={() => onPressLocation(null)}
                           labelStyle={{ fontWeight: '600' }}
                           style={{ paddingHorizontal: 8, minWidth: 80, alignSelf: 'flex-start' }}
            >
              Cancel
            </PrimaryButton>
          </View>

          {(!loading && results.length == 0) && (
            <View className={"w-full px-8 h-full flex  items-center space-y-8 mt-8"}>
              <MapPinIcon width={80} height={80}></MapPinIcon>
              <Text className={"font-light"} variant={"bodyLarge"}>Type something in to search for your location.</Text>
            </View>
          )}
          {loading ? (
              <View style={[styles.loadingWrap, { backgroundColor: colors.surface }]}>
                <LoadingSpinner />
              </View>
            ) :
            <View className={"px-8"}>
              {
                data.map((item, i) => (
                  <Pressable key={i} onPress={() => {
                    onPressLocation(item)
                  }} className={"w-full h-16 bg-white flex flex-row items-center gap-2"}>
                    <MapPinIcon></MapPinIcon>
                    <Text variant={"bodyLarge"}>{item.label ?? item?.rawQuery}</Text>
                  </Pressable>
                ))
              }
            </View> }
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  full: { flex: 1 },
  sheet: {

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
