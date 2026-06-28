import type { ReactNode } from 'react';
import { Text, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, fonts } from '../lib/theme';
import { useTheme, type Mode } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import type { Lang } from '../i18n/translations';

type RowProps = { icon: keyof typeof Ionicons.glyphMap; label: string; selected: boolean; onPress: () => void; last?: boolean };

function OptionList({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.list, { backgroundColor: colors.card }]}>{children}</View>;
}

function Row({ icon, label, selected, onPress, last }: RowProps) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={selected ? colors.accent : colors.muted} />
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      {selected && <Ionicons name="checkmark" size={20} color={colors.accent} style={styles.check} />}
    </Pressable>
  );
}

export default function Settings() {
  const { colors, mode, setMode } = useTheme();
  const { t, lang, setLang } = useI18n();
  const router = useRouter();

  const themes: { value: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: t('themeLight'), icon: 'sunny-outline' },
    { value: 'dark', label: t('themeDark'), icon: 'moon-outline' },
    { value: 'system', label: t('themeSystem'), icon: 'phone-portrait-outline' },
  ];
  const langs: { value: Lang; label: string }[] = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'it', label: 'Italiano' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel={t('back')} style={[styles.close, { backgroundColor: colors.card }]}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.label, { color: colors.muted }]}>{t('theme')}</Text>
        <OptionList>
          {themes.map((o, i) => (
            <Row key={o.value} icon={o.icon} label={o.label} selected={mode === o.value} onPress={() => setMode(o.value)} last={i === themes.length - 1} />
          ))}
        </OptionList>

        <Text style={[styles.label, { color: colors.muted }]}>{t('language')}</Text>
        <OptionList>
          {langs.map((o, i) => (
            <Row key={o.value} icon="language-outline" label={o.label} selected={lang === o.value} onPress={() => setLang(o.value)} last={i === langs.length - 1} />
          ))}
        </OptionList>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.sansBold, fontSize: 26 },
  close: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, gap: spacing.sm },
  label: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: spacing.md, marginBottom: spacing.xs, marginLeft: spacing.xs },
  list: { borderRadius: radius.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 15 },
  rowLabel: { fontFamily: fonts.sansMed, fontSize: 16 },
  check: { marginLeft: 'auto' },
});
