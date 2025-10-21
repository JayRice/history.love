import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ActivityType } from "@/src/types/Calender";


export const activityIcon = (t?: ActivityType, size = 14) => {
  const common = { size } as const;
  switch (t) {
    case "date-night": return <MaterialCommunityIcons name="heart" {...common} />;
    case "workout": return <MaterialCommunityIcons name="dumbbell" {...common} />;
    case "movie": return <MaterialCommunityIcons name="movie-open" {...common} />;
    case "anniversary": return <MaterialCommunityIcons name="cake-variant" {...common} />;
    case "study": return <MaterialCommunityIcons name="book-open-variant" {...common} />;
    case "dinner": return <MaterialCommunityIcons name="silverware-fork-knife" {...common} />;
    case "appointment": return <MaterialCommunityIcons name="calendar-clock" {...common} />;
    default: return <MaterialCommunityIcons name="calendar-blank" {...common} />;
  }
};


// (Optional) background color per activity for quick visual grouping
export const activityColor = (t?: ActivityType) => {
  switch (t) {
    case "date-night": return "#f06292"; // pink
    case "workout": return "#64b5f6"; // blue
    case "movie": return "#9575cd"; // purple
    case "anniversary": return "#ffb74d";// orange
    case "study": return "#4db6ac"; // teal
    case "dinner": return "#81c784"; // green
    case "appointment": return "#90a4ae";// grey
    default: return "#9e9e9e";
  }
};