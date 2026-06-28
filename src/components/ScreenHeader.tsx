import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { spacing, fonts } from '../lib/theme';

export function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={12}>
          <Text style={[styles.back, { color: colors.accent }]}>{`‹ ${t('back')}`}</Text>
        </Pressable>
      ) : <View style={styles.spacer} />}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  back: { fontFamily: fonts.sansMed, fontSize: 16 },
  title: { fontFamily: fonts.sansSemi, fontSize: 16 },
  spacer: { width: 56 },
});
