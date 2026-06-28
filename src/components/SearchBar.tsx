import { TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing, fonts } from '../lib/theme';

export function SearchBar({ value, onChangeText, placeholder = 'Search your name…' }:
  { value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoFocus
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.card, borderRadius: radius.card, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, fontFamily: fonts.sans, fontSize: 18, color: colors.text,
  },
});
