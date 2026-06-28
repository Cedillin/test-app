import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fonts } from '../lib/theme';

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.text, borderRadius: radius.card, paddingVertical: spacing.md + 2, alignItems: 'center' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  label: { color: colors.white, fontFamily: fonts.sansSemi, fontSize: 18 },
});
