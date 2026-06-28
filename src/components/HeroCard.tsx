import { ImageBackground, Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, fonts } from '../lib/theme';

export function HeroCard({ label, title, subtitle, image }:
  { label: string; title: string; subtitle: string; image: string }) {
  return (
    <ImageBackground source={{ uri: image }} style={styles.bg} imageStyle={styles.img}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { height: 200, borderRadius: radius.hero, overflow: 'hidden', justifyContent: 'flex-end' },
  img: { borderRadius: radius.hero },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  content: { padding: spacing.lg, gap: 2 },
  label: { color: colors.white, fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, opacity: 0.9 },
  title: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 28 },
  subtitle: { color: colors.white, fontFamily: fonts.sans, fontSize: 14, opacity: 0.9 },
});
