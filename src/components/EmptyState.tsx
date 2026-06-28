import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, fonts } from '../lib/theme';

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.box}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.xs },
  title: { fontFamily: fonts.sansSemi, fontSize: 18 },
  sub: { fontFamily: fonts.sans, fontSize: 14, textAlign: 'center' },
});
