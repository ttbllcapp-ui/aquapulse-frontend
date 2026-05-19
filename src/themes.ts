export type ThemeId = 'ocean' | 'sunset' | 'forest' | 'coral' | 'aurora' | 'light';

export interface Palette {
  id: ThemeId;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  primary: string;
  primaryDark: string;
  accentPlant: string;
  accentCoral: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  glassBg: string;
  glassBgLight: string;
  waterLight: string;
  waterMid: string;
  waterDeep: string;
  overlay: string;
  bgGradient: [string, string, string];
  primaryGradient: [string, string];
  onPrimary: string; // text on primary gradient button
  isDark: boolean;
}

export const THEMES: Record<ThemeId, Palette> = {
  ocean: {
    id: 'ocean',
    bgPrimary: '#040F16', bgSecondary: '#0A2463', bgCard: '#0F3A70',
    primary: '#00E5FF', primaryDark: '#0088FF',
    accentPlant: '#00FF87', accentCoral: '#FF5252',
    textPrimary: '#FFFFFF', textSecondary: '#A0B5D9', textMuted: '#6B85B0',
    border: 'rgba(255, 255, 255, 0.1)', borderLight: 'rgba(255, 255, 255, 0.15)',
    glassBg: 'rgba(15, 58, 112, 0.4)', glassBgLight: 'rgba(15, 58, 112, 0.6)',
    waterLight: '#00E5FF', waterMid: '#00B8FF', waterDeep: '#0088FF',
    overlay: 'rgba(4, 15, 22, 0.55)',
    bgGradient: ['#0F3A70', '#0A2463', '#040F16'],
    primaryGradient: ['#00E5FF', '#0088FF'],
    onPrimary: '#001428',
    isDark: true,
  },
  sunset: {
    id: 'sunset',
    bgPrimary: '#1A0A1A', bgSecondary: '#2D1B3D', bgCard: '#3E2652',
    primary: '#FFB347', primaryDark: '#FF6B6B',
    accentPlant: '#FFD166', accentCoral: '#FF5E78',
    textPrimary: '#FFFFFF', textSecondary: '#E6C8D9', textMuted: '#A58EA8',
    border: 'rgba(255, 255, 255, 0.1)', borderLight: 'rgba(255, 255, 255, 0.15)',
    glassBg: 'rgba(62, 38, 82, 0.4)', glassBgLight: 'rgba(62, 38, 82, 0.6)',
    waterLight: '#FFB347', waterMid: '#FF8C5A', waterDeep: '#FF6B6B',
    overlay: 'rgba(26, 10, 26, 0.55)',
    bgGradient: ['#3E2652', '#2D1B3D', '#1A0A1A'],
    primaryGradient: ['#FFB347', '#FF6B6B'],
    onPrimary: '#2D0F00',
    isDark: true,
  },
  forest: {
    id: 'forest',
    bgPrimary: '#0A1F14', bgSecondary: '#123D25', bgCard: '#1D5936',
    primary: '#4ADE80', primaryDark: '#14B8A6',
    accentPlant: '#A3E635', accentCoral: '#F97316',
    textPrimary: '#FFFFFF', textSecondary: '#B5D9C3', textMuted: '#7FA08B',
    border: 'rgba(255, 255, 255, 0.1)', borderLight: 'rgba(255, 255, 255, 0.15)',
    glassBg: 'rgba(29, 89, 54, 0.4)', glassBgLight: 'rgba(29, 89, 54, 0.6)',
    waterLight: '#4ADE80', waterMid: '#22C55E', waterDeep: '#14B8A6',
    overlay: 'rgba(10, 31, 20, 0.55)',
    bgGradient: ['#1D5936', '#123D25', '#0A1F14'],
    primaryGradient: ['#4ADE80', '#14B8A6'],
    onPrimary: '#002818',
    isDark: true,
  },
  coral: {
    id: 'coral',
    bgPrimary: '#1A0612', bgSecondary: '#4A0E2E', bgCard: '#6B1B3F',
    primary: '#FF6B9D', primaryDark: '#E91E63',
    accentPlant: '#FFD166', accentCoral: '#FF3366',
    textPrimary: '#FFFFFF', textSecondary: '#F2C8D9', textMuted: '#B58EA0',
    border: 'rgba(255, 255, 255, 0.1)', borderLight: 'rgba(255, 255, 255, 0.15)',
    glassBg: 'rgba(107, 27, 63, 0.4)', glassBgLight: 'rgba(107, 27, 63, 0.6)',
    waterLight: '#FF6B9D', waterMid: '#F43F80', waterDeep: '#E91E63',
    overlay: 'rgba(26, 6, 18, 0.55)',
    bgGradient: ['#6B1B3F', '#4A0E2E', '#1A0612'],
    primaryGradient: ['#FF6B9D', '#E91E63'],
    onPrimary: '#280010',
    isDark: true,
  },
  aurora: {
    id: 'aurora',
    bgPrimary: '#050818', bgSecondary: '#1A1647', bgCard: '#2A2470',
    primary: '#A855F7', primaryDark: '#6366F1',
    accentPlant: '#22D3EE', accentCoral: '#EC4899',
    textPrimary: '#FFFFFF', textSecondary: '#C8B5E6', textMuted: '#8A7AAB',
    border: 'rgba(255, 255, 255, 0.1)', borderLight: 'rgba(255, 255, 255, 0.15)',
    glassBg: 'rgba(42, 36, 112, 0.4)', glassBgLight: 'rgba(42, 36, 112, 0.6)',
    waterLight: '#A855F7', waterMid: '#818CF8', waterDeep: '#6366F1',
    overlay: 'rgba(5, 8, 24, 0.55)',
    bgGradient: ['#2A2470', '#1A1647', '#050818'],
    primaryGradient: ['#A855F7', '#6366F1'],
    onPrimary: '#0A0028',
    isDark: true,
  },
  light: {
    id: 'light',
    bgPrimary: '#F4FAFF', bgSecondary: '#E0F2FE', bgCard: '#FFFFFF',
    primary: '#0284C7', primaryDark: '#0369A1',
    accentPlant: '#16A34A', accentCoral: '#E11D48',
    textPrimary: '#0C1F2E', textSecondary: '#4B5B6B', textMuted: '#8096A8',
    border: 'rgba(12, 31, 46, 0.1)', borderLight: 'rgba(12, 31, 46, 0.15)',
    glassBg: 'rgba(255, 255, 255, 0.7)', glassBgLight: 'rgba(255, 255, 255, 0.9)',
    waterLight: '#7DD3FC', waterMid: '#38BDF8', waterDeep: '#0284C7',
    overlay: 'rgba(244, 250, 255, 0.3)',
    bgGradient: ['#E0F2FE', '#F4FAFF', '#FFFFFF'],
    primaryGradient: ['#38BDF8', '#0284C7'],
    onPrimary: '#FFFFFF',
    isDark: false,
  },
};

export const THEME_LIST: { id: ThemeId; key: string }[] = [
  { id: 'ocean', key: 'theme_ocean' },
  { id: 'sunset', key: 'theme_sunset' },
  { id: 'forest', key: 'theme_forest' },
  { id: 'coral', key: 'theme_coral' },
  { id: 'aurora', key: 'theme_aurora' },
  { id: 'light', key: 'theme_light' },
];
