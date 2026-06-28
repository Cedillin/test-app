import { Text, View, StyleSheet } from 'react-native';
import { radius, spacing, fonts } from '../lib/theme';
import { tagStyle } from '../lib/theme';

export function TagPill({ label }: { label: string }) {
  const s = tagStyle(label);
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
});
