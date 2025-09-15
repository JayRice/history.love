export const colors = {
  primary: '#E63946',
  secondary: '#1D3557',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  card_surface: '#e7e7e7',

  accent: {
    primary: "#FDEDEE",
    gold: '#FFD700',
    pink: '#FFC0CB',
    softPink: '#F8BBD9',
  },
  
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
  },
  
  semantic: {
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
    info: '#4285F4',
  },
  
  text: {
    primary: '#202124',
    secondary: '#5F6368',
    disabled: '#9AA0A6',
    inverse: '#FFFFFF',
  }
} as const;

export type Colors = typeof colors;