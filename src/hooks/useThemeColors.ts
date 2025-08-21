import { useTheme } from 'react-native-paper';

export const useThemeColors = () => {
  const theme = useTheme();
  return theme.colors;
};