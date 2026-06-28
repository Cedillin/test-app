export const colors = {
  background: '#FFFFFF',
  card: '#F4F4F5',
  text: '#0A0A0A',
  muted: '#737373',
  topBar: '#1A1A1A',
  accent: '#2563EB',
  white: '#FFFFFF',
  border: '#E5E5E5',
  tagDefault: { bg: '#F4F4F5', fg: '#525252' },
} as const;

const TAGS: Record<string, { bg: string; fg: string }> = {
  KIDS: { bg: '#FCE7F3', fg: '#DB2777' },
  YOGA: { bg: '#DBEAFE', fg: '#2563EB' },
  MMA: { bg: '#FFEDD5', fg: '#EA580C' },
  BJJ: { bg: '#DCFCE7', fg: '#16A34A' },
};

export function tagStyle(tag: string) {
  return TAGS[tag.toUpperCase()] ?? colors.tagDefault;
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { card: 16, hero: 24, pill: 999 } as const;

export const fonts = {
  sans: 'Geist_400Regular',
  sansMed: 'Geist_500Medium',
  sansSemi: 'Geist_600SemiBold',
  sansBold: 'Geist_700Bold',
  sansBlack: 'Geist_900Black',
  mono: 'GeistMono_400Regular',
} as const;
