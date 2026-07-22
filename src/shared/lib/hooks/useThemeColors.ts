import { useTheme } from 'react-native-paper';
import type { AppColors } from '@/src/shared/ui/theme/paperTheme';

export const useThemeColors = (): AppColors => {
  const theme = useTheme();
  // Compatibility boundary: PaperProvider is configured with paperTheme,
  // which extends MD3 colors with the custom tokens declared in AppColors.
  // react-native-paper's useTheme() cannot know about them, so this is the
  // single sanctioned cast for theme colors.
  return theme.colors as AppColors;
};