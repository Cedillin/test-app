import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, fonts } from '../lib/theme';

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.btn, { backgroundColor: colors.text }, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[styles.label, { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius.card, paddingVertical: spacing.md + 2, alignItems: 'center' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  label: { fontFamily: fonts.sansSemi, fontSize: 18 },
});
