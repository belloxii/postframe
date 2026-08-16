export type PostSource = 'facebook' | 'manual' | 'ai-extracted' | 'sample';

export interface PostImage {
  id: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
}

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Post {
  id: string;
  source: PostSource;
  sourceUrl: string;
  author: string;
  authorHandle?: string;
  authorProfileUrl?: string;
  authorAvatarUrl?: string;
  verified: boolean;
  badgeType?: 'blue' | 'gray' | 'none';
  text: string;
  images: PostImage[];
  publishedAt: string;
  reactions: number;
  topReactions?: ReactionType[];
  comments: number;
  shares: number;
  engagementTotal?: number;
  originalMedia?: string;
  location?: string;
  privacy?: 'public' | 'friends' | 'custom';
}

export type TemplateType = 'classic' | 'minimal' | 'dark' | 'news' | 'story' | 'quote';

export type AspectRatioType = '1:1' | '4:5' | '9:16' | '16:9' | 'auto';

export type BackgroundType = 'solid' | 'gradient' | 'mesh' | 'blur' | 'pattern' | 'transparent';

export type FontFamilyType = 
  | 'Inter' 
  | 'Plus Jakarta Sans' 
  | 'Poppins' 
  | 'Outfit' 
  | 'Merriweather' 
  | 'Playfair Display' 
  | 'Space Grotesk' 
  | 'JetBrains Mono';

export type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type TextAlignment = 'left' | 'center' | 'justify';

export type ImageLayoutMode = 'auto' | 'hero' | 'grid' | 'split' | 'strip';

export type CardShadowOption = 'none' | 'subtle' | 'soft' | 'dramatic' | 'glow';

export type CardThemeOption = 'light' | 'dark' | 'glass';

export type EngagementDisplayFormat = 'compact' | 'exact' | 'hidden';

export interface DesignSettings {
  template: TemplateType;
  aspectRatio: AspectRatioType;
  exportResolution: 1 | 2 | 4;
  customWidth: number;
  customHeight: number;
  
  // Background
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  blurIntensity: number;
  patternType: 'none' | 'dots' | 'grid' | 'noise';

  // Card appearance
  cardTheme: CardThemeOption;
  cardBackground: string;
  cardTextColor: string;
  cardPadding: number;
  cardRadius: number;
  cardShadow: CardShadowOption;
  cardBorder: boolean;
  cardBorderColor: string;
  cardOpacity: number;

  // Typography
  fontFamily: FontFamilyType;
  fontSize: FontSizeOption;
  lineHeight: number;
  textAlignment: TextAlignment;
  maxTextLines?: number;

  // Image Layout
  imageLayout: ImageLayoutMode;
  imageBorderRadius: number;
  imageSpacing: number;
  maxVisibleImages: number;

  // Element Toggles
  showAvatar: boolean;
  showVerification: boolean;
  showDate: boolean;
  showEngagement: boolean;
  engagementFormat: EngagementDisplayFormat;
  selectedReactions: ReactionType[];
  showFacebookLogo: boolean;
  showOriginalUrl: boolean;
  showQrCode: boolean;
  showWatermark: boolean;
  watermarkText: string;
  
  // Multi-page handling for very long posts
  multiPageMode: boolean;
  activePageIndex: number;
}

export interface ExportPreset {
  id: string;
  name: string;
  platform: string;
  aspectRatio: AspectRatioType;
  width: number;
  height: number;
  iconName: string;
}

export interface ExtractionResult {
  success: boolean;
  post?: Post;
  warning?: string;
  error?: string;
  isRestricted?: boolean;
  requiresManualImport?: boolean;
}
