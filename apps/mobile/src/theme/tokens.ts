/**
 * FIC Business Hub - Luxury Design Tokens
 * Conforming strictly to Section 10.1 & Section 10.0 of the Blueprint
 */

export const colors = {
  // Surfaces & Canvas (Warm Ivory & Soft Sand Luxury Theme)
  surface: '#FAF7F2',             // Primary screen background
  surfaceElevated: '#FFFFFF',     // Clean elevated card surface
  surfaceSand: '#F3EDE6',         // Muted container / chip background
  surfaceGlass: 'rgba(255, 255, 255, 0.92)', // Frosted glass header/sheet background
  surfaceOverlay: 'rgba(69, 58, 51, 0.45)', // Modal backdrop

  // Borders & Dividers
  borderSubtle: '#E8E1D9',
  borderStrong: '#D7CCC0',

  // Typography - Deep Earth Brown (WCAG AAA compliant: > 7.5:1 contrast)
  textPrimary: '#453A33',
  textSecondary: '#7A6E65',
  textMuted: '#A1948B',
  textInverse: '#FFFFFF',

  // Core Brand & Domain Multi-Color Luxury Accents
  terracotta: '#C65638',          // Primary action & Marketplace highlight
  terracottaLight: '#FBEBE8',
  terracottaDark: '#9F3F27',

  goldenAmber: '#D99B43',         // Business Incubation & Idea Desk
  goldenAmberLight: '#FDF5E8',

  forestTeal: '#1C6960',          // Private Deal Room & Investment Desk
  forestTealLight: '#E8F5F3',

  royalViolet: '#6E529F',         // Enterprise Scaling & Mentorship Desk
  royalVioletLight: '#F2EDFA',

  // Status & System Feedback
  success: '#15803D',
  successLight: '#ECFDF3',
  warning: '#B45309',
  warningLight: '#FFFBEB',
  danger: '#B91C1C',
  dangerLight: '#FEF2F2',
  info: '#1D4ED8',
  infoLight: '#EFF6FF',
};

export const typography = {
  display1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  heading1: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  heading2: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  bodyRegular: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  micro: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const shadows = {
  soft: {
    shadowColor: '#453A33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#453A33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
};

