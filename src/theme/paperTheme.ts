import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primary_accent: colors.accent.primary,
    card_surface: colors.card_surface,
    secondary: colors.secondary,
    tertiary: colors.accent.gold,
    surface: colors.surface,
    background: colors.background,
    error: colors.semantic.error,
    onPrimary: colors.text.inverse,
    onSecondary: colors.text.inverse,
    onSurface: colors.text.primary,
    onBackground: colors.text.primary,
    outline: colors.gray[300],
    outlineVariant: colors.gray[200],
    surfaceVariant: colors.gray[50],
    onSurfaceVariant: colors.text.secondary,

    beige: colors.beige,
  },
};