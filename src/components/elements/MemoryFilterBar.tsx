// components/MemoryFilterBar.tsx
import React from "react";
import { View } from "react-native";
import { Chip, TextInput, Switch, Text, useTheme, Divider } from "react-native-paper";
import type Memory from "@/src/types/Memory";
import type { MemoryMood, MemoryCategory } from "@/src/types/Memory";
import { MemoryMoodList, MemoryCategoryList } from "@/src/types/Memory";

export type MemoryFilter = {
  moods: Set<MemoryMood>;
  categories: Set<MemoryCategory>;
  withPrivateOnly: boolean;
  withLocationOnly: boolean;
  query: string; // searches title/note
};

export function defaultMemoryFilter(): MemoryFilter {
  return {
    moods: new Set<MemoryMood>(),
    categories: new Set<MemoryCategory>(),
    withPrivateOnly: false,
    withLocationOnly: false,
    query: "",
  };
}

export function MemoryFilterBar({
                                  filter,
                                  setFilter,
                                }: {
  filter: MemoryFilter;
  setFilter: (next: MemoryFilter) => void;
}) {
  const theme = useTheme();

  const toggleMood = (m: MemoryMood) => {
    const next = new Set(filter.moods);
    next.has(m) ? next.delete(m) : next.add(m);
    setFilter({ ...filter, moods: next });
  };

  const toggleCategory = (c: MemoryCategory) => {
    const next = new Set(filter.categories);
    next.has(c) ? next.delete(c) : next.add(c);
    setFilter({ ...filter, categories: next });
  };

  return (
    <View style={{ gap: 10 }}>
      {/* Query */}
      <TextInput
        value={filter.query}
        onChangeText={(t) => setFilter({ ...filter, query: t })}
        placeholder="Search title or note…"
        mode="outlined"
        style={{ borderRadius: 12 }}
      />

      {/* Moods */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {MemoryMoodList.map((m) => (
          <Chip
            key={m}
            selected={filter.moods.has(m)}
            showSelectedCheck={false}
            compact
            mode="outlined"
            onPress={() => toggleMood(m)}
          >
            {m}
          </Chip>
        ))}
      </View>

      {/* Categories */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {MemoryCategoryList.map((c) => (
          <Chip
            key={c}
            selected={filter.categories.has(c)}
            showSelectedCheck={false}
            compact
            mode="outlined"
            onPress={() => toggleCategory(c)}
          >
            {c}
          </Chip>
        ))}
      </View>

      <Divider style={{ opacity: 0.2 }} />

      {/* Toggles */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Switch
            value={filter.withPrivateOnly}
            onValueChange={(v) => setFilter({ ...filter, withPrivateOnly: v })}
          />
          <Text>Private only</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Switch
            value={filter.withLocationOnly}
            onValueChange={(v) => setFilter({ ...filter, withLocationOnly: v })}
          />
          <Text>Has location</Text>
        </View>
      </View>
    </View>
  );
}

/** Pure function to filter memories */
export function applyMemoryFilter(memories: Memory[], filter: MemoryFilter): Memory[] {
  const query = filter.query.trim().toLowerCase();

  return memories.filter((m) => {
    // moods
    if (filter.moods.size && (!m.mood || !filter.moods.has(m.mood))) return false;

    // categories
    if (filter.categories.size) {
      const cats = new Set(m.categories ?? []);
      // at least one match
      let ok = false;
      for (const c of filter.categories) if (cats.has(c)) { ok = true; break; }
      if (!ok) return false;
    }

    // private only
    if (filter.withPrivateOnly && !m.private_note) return false;

    // has location
    if (filter.withLocationOnly && !m.location) return false;

    // query in title or note
    if (query) {
      const hay = `${m.title ?? ""} ${m.note ?? ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }

    return true;
  });
}
