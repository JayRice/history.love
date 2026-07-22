import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

/**
 * The app's theme colors: MD3 plus the custom tokens added below.
 *
 * `border`, `text`, and `textSecondary` are referenced by some legacy
 * inputs (RepeatPicker, TimeOfDayPicker, DateTimeRangeField) but are NOT
 * defined in this theme, so they are `undefined` at runtime today. They
 * are typed optional to reflect that reality; defining them is UI-phase
 * work (see docs/migration-status.md).
 */
export type AppColors = typeof MD3LightTheme.colors & {
  primaryAccent: string;
  primaryAccent2: string;
  card_surface: string;
  secondaryAccent: string;
  secondaryAccent2: string;
  border?: string;
  text?: string;
  textSecondary?: string;
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryAccent: colors.accent.primary,
    primaryAccent2: colors.accent.primary2,
    card_surface: colors.card_surface,
    secondary: colors.secondary,
    secondaryAccent: colors.accent.secondary,
    secondaryAccent2: colors.accent.secondary2,
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

  },
};