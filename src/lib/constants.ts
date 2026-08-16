import { DesignSettings, ExportPreset, ReactionType } from '../types';

export const ALL_REACTIONS: { type: ReactionType; label: string; emoji: string; color: string; iconSvgUrl?: string }[] = [
  { type: 'like', label: 'Like', emoji: '👍', color: '#1877F2' },
  { type: 'love', label: 'Love', emoji: '❤️', color: '#F33E58' },
  { type: 'care', label: 'Care', emoji: '🥰', color: '#F7B125' },
  { type: 'haha', label: 'Haha', emoji: '😆', color: '#F7B125' },
  { type: 'wow', label: 'Wow', emoji: '😮', color: '#F7B125' },
  { type: 'sad', label: 'Sad', emoji: '😢', color: '#F7B125' },
  { type: 'angry', label: 'Angry', emoji: '😡', color: '#E9710F' },
];

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'sq-2400',
    name: 'Master Square (2400×2400)',
    platform: 'Instagram / All Feeds',
    aspectRatio: '1:1',
    width: 2400,
    height: 2400,
    iconName: 'Square',
  },
  {
    id: 'sq-1200',
    name: 'Standard Square (1200×1200)',
    platform: 'Facebook / X / LinkedIn',
    aspectRatio: '1:1',
    width: 1200,
    height: 1200,
    iconName: 'Square',
  },
  {
    id: 'portrait-1200-1500',
    name: 'Portrait Feed (1200×1500)',
    platform: 'Instagram 4:5 / Pinterest',
    aspectRatio: '4:5',
    width: 1200,
    height: 1500,
    iconName: 'Smartphone',
  },
  {
    id: 'portrait-1080-1350',
    name: 'Instagram Portrait (1080×1350)',
    platform: 'Instagram 4:5 Feed',
    aspectRatio: '4:5',
    width: 1080,
    height: 1350,
    iconName: 'Smartphone',
  },
  {
    id: 'story-1080-1920',
    name: 'Vertical Story (1080×1920)',
    platform: 'Stories / Reels / TikTok',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    iconName: 'Smartphone',
  },
  {
    id: 'landscape-1920-1080',
    name: 'Landscape HD (1920×1080)',
    platform: 'Twitter/X / Slides / Web',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    iconName: 'Monitor',
  },
  {
    id: 'auto-card',
    name: 'Dynamic Auto Height',
    platform: 'Fluid Social Card',
    aspectRatio: 'auto',
    width: 1200,
    height: 0, // dynamic
    iconName: 'Maximize2',
  },
];

export const GRADIENT_PRESETS = [
  { name: 'Royal Twilight', start: '#0f172a', end: '#1e3a8a', angle: 135 },
  { name: 'Facebook Classic', start: '#0b132b', end: '#1c2541', angle: 160 },
  { name: 'Sunset Aura', start: '#31103f', end: '#701a75', angle: 135 },
  { name: 'Emerald Forest', start: '#064e3b', end: '#022c22', angle: 145 },
  { name: 'Obsidian Velvet', start: '#18181b', end: '#09090b', angle: 180 },
  { name: 'Cosmic Magenta', start: '#4c0519', end: '#1e1b4b', angle: 120 },
  { name: 'Warm Editorial', start: '#fdfbf7', end: '#e2d9cc', angle: 135 },
  { name: 'Clean Studio Light', start: '#f8fafc', end: '#e2e8f0', angle: 180 },
  { name: 'Deep Sea Abyss', start: '#030712', end: '#0369a1', angle: 140 },
  { name: 'Vibrant Mesh Aura', start: '#1e1b4b', end: '#431407', angle: 90 },
];

export const FONT_OPTIONS = [
  { id: 'Inter', name: 'Inter', category: 'Modern Sans' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Clean Tech' },
  { id: 'Poppins', name: 'Poppins', category: 'Geometric Sans' },
  { id: 'Outfit', name: 'Outfit', category: 'Bold Display' },
  { id: 'Merriweather', name: 'Merriweather', category: 'Editorial Serif' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'Luxury Serif' },
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'Modern Mono/Sans' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'Code Mono' },
];

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
  template: 'classic',
  aspectRatio: '1:1',
  exportResolution: 2,
  customWidth: 1200,
  customHeight: 1200,
  
  backgroundType: 'gradient',
  backgroundColor: '#0f172a',
  gradientStart: '#0f172a',
  gradientEnd: '#1e293b',
  gradientAngle: 145,
  blurIntensity: 24,
  patternType: 'dots',

  cardTheme: 'light',
  cardBackground: '#ffffff',
  cardTextColor: '#0f172a',
  cardPadding: 32,
  cardRadius: 20,
  cardShadow: 'soft',
  cardBorder: true,
  cardBorderColor: 'rgba(226, 232, 240, 0.8)',
  cardOpacity: 100,

  fontFamily: 'Plus Jakarta Sans',
  fontSize: 'md',
  lineHeight: 1.6,
  textAlignment: 'left',

  imageLayout: 'auto',
  imageBorderRadius: 14,
  imageSpacing: 8,
  maxVisibleImages: 4,

  showAvatar: true,
  showVerification: true,
  showDate: true,
  showEngagement: true,
  engagementFormat: 'compact',
  selectedReactions: ['like', 'love', 'care'],
  showFacebookLogo: true,
  showOriginalUrl: true,
  showQrCode: false,
  showWatermark: false,
  watermarkText: 'PostFrame',
  
  multiPageMode: false,
  activePageIndex: 0,
};
