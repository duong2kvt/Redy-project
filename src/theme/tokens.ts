/**
 * Redy Design System tokens — mirrored from the Figma file
 * "Redy-Design-System" (variables: Primitive_Colors, Theme-Colors,
 * Theme-Spacings, Theme-Corner-Radius, text & effect styles).
 */

export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  beige: '#FCF8F7',

  gray50: '#F7F7F7',
  gray100: '#F2F2F2',
  gray200: '#E5E5E5',
  gray300: '#D1D1D1',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#2E2E2E',
  gray800: '#1F1F1F',
  gray900: '#1A1A1A',
  gray950: '#121212',

  tomato50: '#FFF3F1',
  tomato100: '#FFE6E1',
  tomato200: '#FFD1C8',
  tomato300: '#FFB1A1',
  tomato400: '#FE846B',
  tomato500: '#F65737',
  tomato600: '#E43F1E',
  tomato700: '#C03215',

  leaf50: '#F3FBF2',
  leaf100: '#E2F7E1',
  leaf200: '#C7EDC5',
  leaf300: '#9BDD98',
  leaf500: '#45B441',
  leaf600: '#318B2E',

  blue100: '#DBE8FE',
  blue200: '#BFD7FE',
  blue300: '#93BBFD',
  blue500: '#3B82F6',
  blue600: '#2570EB',

  amber50: '#FFFBEB',
  amber100: '#FFF4C6',
  amber200: '#FFE888',
  amber300: '#FFD64A',
  amber400: '#FFC220',
  amber500: '#F9A006',

  orange50: '#FFF8ED',
  orange100: '#FFF0D5',
  orange200: '#FEDDAA',
  orange300: '#FDC474',
  orange500: '#F98315',

  pumpkin500: '#F97316',
  red500: '#F63737',
  violet500: '#8B5CF6',
} as const;

export const colors = {
  // content
  contentStrong: palette.gray950,
  contentMedium: palette.gray600,
  contentLight: palette.gray400,
  contentDisabled: palette.gray300,
  contentPrimary: palette.tomato500,
  contentPositive: palette.leaf500,
  contentInfo: palette.blue500,
  contentWarning: palette.amber500,
  contentInverse: palette.white,
  // backgrounds
  bgMain: palette.beige,
  bgSurface: palette.white,
  bgNeutral: palette.gray50,
  bgPrimary: palette.tomato500,
  bgPrimaryPress: palette.tomato700,
  bgPrimarySubtle: palette.tomato100,
  bgPositiveSubtle: palette.leaf100,
  bgInk: palette.gray950,
  // borders
  borderLight: palette.gray200,
  borderPositive: palette.leaf500,
  borderPrimary: palette.tomato500,
  overlay: 'rgba(0,0,0,0.68)',
} as const;

export const space = {
  '3xs': 2,
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const radius = {
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  full: 1000,
} as const;

/**
 * Headlines use "SK Seren" (assets/fonts), body text uses Poppins —
 * same as the Figma text styles (Display * / Text *).
 */
export const fonts = {
  displayMedium: 'SKSeren-Medium',
  displaySemi: 'SKSeren-SemiBold',
  displayBold: 'SKSeren-Bold',
  displayExtraBold: 'SKSeren-ExtraBold',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const type = {
  display2xl: { fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56 },
  displayLg: { fontFamily: fonts.displayBold, fontSize: 44, lineHeight: 44 },
  displayLgSemi: { fontFamily: fonts.displaySemi, fontSize: 44, lineHeight: 44 },
  displayMd: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 34 },
  displayMdSemi: { fontFamily: fonts.displaySemi, fontSize: 32, lineHeight: 34 },
  displaySm: { fontFamily: fonts.displaySemi, fontSize: 24, lineHeight: 26 },
  displayXs: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 22 },
  display2xs: { fontFamily: fonts.displayBold, fontSize: 18, lineHeight: 20 },
  textLg: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  textLgMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  textLgSemi: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  textMd: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  textMdMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  textMdSemi: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  textSm: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  textSmMedium: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  textSmSemi: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 12 },
  buttonMd: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
} as const;

export const shadow = {
  sm: {
    shadowColor: '#0A0D12',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  lg: {
    shadowColor: '#0A0D12',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  xl: {
    shadowColor: '#0A0D12',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
} as const;

/** Motion presets — durations/easings taken from the Figma prototype. */
export const motion = {
  dissolve: 300, // DISSOLVE 300ms linear (most navigations)
  smart: 300, // SMART_ANIMATE 300ms
  hop: 600, // "Hoping anim" 600ms ease-out, 1s delay
  scanLoop: 800,
  spring: { damping: 14, stiffness: 180, mass: 0.8 },
  springSoft: { damping: 18, stiffness: 120 },
} as const;
