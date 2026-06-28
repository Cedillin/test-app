import { Text, View, StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '../lib/theme';

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.xs },
  title: { color: colors.text, fontFamily: fonts.sansSemi, fontSize: 18 },
  sub: { color: colors.muted, fontFamily: fonts.sans, fontSize: 14, textAlign: 'center' },
});
