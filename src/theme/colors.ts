/* ─── 4Kit Professional Color Palette Design System ─── */

export interface CategoryTheme {
  id: string;
  name: string;
  primary: string;
  dark: string;
  gradient: string;
  glow: string;
  lightBg: string;
  accentBorder: string;
  buttonBg: string;
  buttonHover: string;
  successBg: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  food: {
    id: 'food',
    name: 'Gourmet Crimson',
    primary: '#DC2626',
    dark: '#991B1B',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
    glow: '0 14px 40px rgba(220, 38, 38, 0.45)',
    lightBg: '#FEF2F2',
    accentBorder: '#FCA5A5',
    buttonBg: '#DC2626',
    buttonHover: '#B91C1C',
    successBg: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
  },
  supermarket: {
    id: 'supermarket',
    name: 'Fresh Emerald',
    primary: '#059669',
    dark: '#047857',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    glow: '0 14px 40px rgba(5, 150, 105, 0.45)',
    lightBg: '#ECFDF5',
    accentBorder: '#6EE7B7',
    buttonBg: '#059669',
    buttonHover: '#047857',
    successBg: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Electric Sapphire',
    primary: '#2563EB',
    dark: '#1D4ED8',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    glow: '0 14px 40px rgba(37, 99, 235, 0.45)',
    lightBg: '#EFF6FF',
    accentBorder: '#93C5FD',
    buttonBg: '#2563EB',
    buttonHover: '#1D4ED8',
    successBg: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
  },
  bakery: {
    id: 'bakery',
    name: 'Artisan Amber',
    primary: '#D97706',
    dark: '#B45309',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    glow: '0 14px 40px rgba(217, 119, 6, 0.45)',
    lightBg: '#FFFBEB',
    accentBorder: '#FDE68A',
    buttonBg: '#D97706',
    buttonHover: '#B45309',
    successBg: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
  },
  express: {
    id: 'express',
    name: 'Royal Amethyst',
    primary: '#7C3AED',
    dark: '#6D28D9',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    glow: '0 14px 40px rgba(124, 58, 237, 0.45)',
    lightBg: '#F5F3FF',
    accentBorder: '#C4B5FD',
    buttonBg: '#7C3AED',
    buttonHover: '#6D28D9',
    successBg: 'linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)',
    badgeBg: '#EDE9FE',
    badgeText: '#5B21B6',
  },
  snacks: {
    id: 'snacks',
    name: 'Ruby Cinema',
    primary: '#E11D48',
    dark: '#BE123C',
    gradient: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
    glow: '0 14px 40px rgba(225, 29, 72, 0.45)',
    lightBg: '#FFF1F2',
    accentBorder: '#FDA4AF',
    buttonBg: '#E11D48',
    buttonHover: '#BE123C',
    successBg: 'linear-gradient(135deg, #BE123C 0%, #881337 100%)',
    badgeBg: '#FFE4E6',
    badgeText: '#9F1239',
  },
  desserts: {
    id: 'desserts',
    name: 'Gelato Rose',
    primary: '#DB2777',
    dark: '#BE185D',
    gradient: 'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)',
    glow: '0 14px 40px rgba(219, 39, 119, 0.45)',
    lightBg: '#FDF2F8',
    accentBorder: '#FBCFE8',
    buttonBg: '#DB2777',
    buttonHover: '#BE185D',
    successBg: 'linear-gradient(135deg, #BE185D 0%, #831843 100%)',
    badgeBg: '#FCE7F3',
    badgeText: '#9D174D',
  },
  drinks: {
    id: 'drinks',
    name: 'Lagoon Teal',
    primary: '#0D9488',
    dark: '#0F766E',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
    glow: '0 14px 40px rgba(13, 148, 136, 0.45)',
    lightBg: '#F0FDFA',
    accentBorder: '#99F6E4',
    buttonBg: '#0D9488',
    buttonHover: '#0F766E',
    successBg: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
    badgeBg: '#CCFBF1',
    badgeText: '#115E59',
  },
};

export const GLOBAL_PALETTE = {
  cacao: '#140C09',
  espresso: '#241610',
  oatCanvas: '#F8F5F0',
  whiteCard: '#FFFFFF',
  borderWarm: '#EADBCE',
  textPrimary: '#140C09',
  textSecondary: '#6B5548',
  textMuted: '#9C8578',
};
