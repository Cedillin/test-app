import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '../lib/theme';

export function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      ) : <View style={styles.spacer} />}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  back: { color: colors.accent, fontFamily: fonts.sansMed, fontSize: 16 },
  title: { color: colors.text, fontFamily: fonts.sansSemi, fontSize: 16 },
  spacer: { width: 56 },
});
