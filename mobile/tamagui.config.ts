// tamagui.config.ts
import { createTamagui, createTokens, createFont } from '@tamagui/core';
import { shorthands } from '@tamagui/shorthands';
import { themes } from '@tamagui/themes';
import { createMedia } from '@tamagui/react-native-media-driver';

// Plant-themed colors
const plantColors = {
  // Primary greens
  leafLight: '#9FE2BF',
  leaf: '#5DBB63',
  leafDark: '#228B22',
  
  // Secondary earth tones
  soilLight: '#D2B48C',
  soil: '#8B4513',
  soilDark: '#654321',
  
  // Accent colors
  blossom: '#FFB7C5',
  sunlight: '#FFD700',
  water: '#87CEEB',
  terracotta: '#E2725B',
  
  // Neutrals
  moss: '#8A9A5B',
  sage: '#87A96B',
  fern: '#4F7942',
};

// Create custom font
const interFont = createFont({
  family: 'Inter, Helvetica, Arial, sans-serif',
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 28,
    9: 32,
    10: 40,
    11: 48,
    12: 60,
    13: 72,
    14: 84,
  },
  lineHeight: {
    1: 17,
    2: 22,
    3: 25,
    4: 28,
    5: 33,
    6: 38,
    7: 46,
    8: 55,
    9: 65,
    10: 77,
    11: 88,
    12: 108,
    13: 129,
    14: 142,
  },
  weight: {
    4: '300',
    5: '400',
    6: '600',
    7: '700',
    8: '800',
  },
  letterSpacing: {
    4: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
  },
});

// Create tokens with size definition
const size = {
  0: 0,
  0.25: 2,
  0.5: 4,
  0.75: 8,
  1: 20,
  2: 40,
  3: 60,
  4: 160,
  5: 200,
  6: 240,
  7: 280,
  8: 320,
  9: 360,
  10: 400,
  11: 440,
  12: 480,
  13: 520,
  14: 560,
  15: 600,
  16: 640,
  17: 680,
  18: 720,
  19: 760,
  20: 800,
};

const tokens = createTokens({
  size,
  space: { ...size },
  radius: {
    0: 0,
    1: 3,
    2: 5,
    3: 7,
    4: 9,
    5: 10,
    6: 16,
    7: 19,
    8: 22,
    9: 26,
    10: 34,
    11: 42,
    12: 50,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  color: {
    ...plantColors,
    primary: plantColors.leaf,
    secondary: plantColors.moss,
    accent: plantColors.blossom,
    background: '#F9FBF4',
    backgroundHover: '#F0F7E6',
    text: '#1A3C27',
    textLight: '#2D5A3D',
    border: plantColors.moss,
    borderHover: plantColors.leaf,
  },
});

// Create media queries for responsiveness
const media = createMedia({
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
  gtXs: { minWidth: 660 + 1 },
  gtSm: { minWidth: 800 + 1 },
  gtMd: { minWidth: 1020 + 1 },
  gtLg: { minWidth: 1280 + 1 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
});

// Create Tamagui config
const config = createTamagui({
  fonts: {
    heading: interFont,
    body: interFont,
  },
  tokens,
  themes: {
    light: {
      ...themes.light,
      background: tokens.color.background,
      backgroundHover: tokens.color.backgroundHover,
      color: tokens.color.text,
      colorHover: tokens.color.textLight,
      borderColor: tokens.color.border,
      borderColorHover: tokens.color.borderHover,
    },
    dark: {
      ...themes.dark,
      background: '#0A1F12',
      backgroundHover: '#1A3C27',
      color: '#F0F7E6',
      colorHover: '#D4E8D4',
      borderColor: plantColors.moss,
      borderColorHover: plantColors.leaf,
    },
  },
  shorthands,
  media,
});

export type AppConfig = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;