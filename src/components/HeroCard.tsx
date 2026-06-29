import { Text, View, StyleSheet } from 'react-native';
import { ImageBackground } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, fonts } from '../lib/theme';

export function HeroCard({ label, title, subtitle, image, tint }:
  { label: string; title: string; subtitle: string; image: string; tint?: string }) {
  const { colors } = useTheme();
  return (
    <ImageBackground source={{ uri: image }} style={styles.bg} imageStyle={styles.img} contentFit="cover" cachePolicy="memory-disk">
      <View style={[styles.overlay, tint ? { backgroundColor: tint } : null]} />
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.white }]}>{label}</Text>
        <Text style={[styles.title, { color: colors.white }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.white }]}>{subtitle}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { height: 200, borderRadius: radius.hero, overflow: 'hidden', justifyContent: 'flex-end' },
  img: { borderRadius: radius.hero },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  content: { padding: spacing.lg, gap: 2 },
  label: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, opacity: 0.9 },
  title: { fontFamily: fonts.sansBold, fontSize: 28 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, opacity: 0.9 },
});
