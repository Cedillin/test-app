import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, fonts } from '../lib/theme';

export function SearchBar({ value, onChangeText, placeholder = 'Search your name…' }:
  { value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  const { colors } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoFocus
      style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: radius.card, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, fontFamily: fonts.sans, fontSize: 18,
  },
});
