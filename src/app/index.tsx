import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, fonts } from '../lib/theme';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { useClasses, useHydrated, useCheckIns } from '../context/CheckInContext';
import { attendeeCount } from '../lib/attendees';
import { formatHeaderDate } from '../lib/dates';
import { ClassCard } from '../components/ClassCard';
import { HeroCard } from '../components/HeroCard';
import { EmptyState } from '../components/EmptyState';
import type { ClassSession } from '../lib/types';

function CardWithCount({ session }: { session: ClassSession }) {
  const checkins = useCheckIns(session.id);
  return <ClassCard session={session} attendees={attendeeCount(session.roster, checkins)} />;
}

export default function Home() {
  const { colors, resolved, setMode } = useTheme();
  const { t, lang, setLang } = useI18n();
  const hydrated = useHydrated();
  const classes = useClasses();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.date, { color: colors.muted }]}>{formatHeaderDate(new Date(), lang)}</Text>
        <View style={styles.switchRow}>
          <Pressable onPress={() => setMode(resolved === 'dark' ? 'light' : 'dark')} hitSlop={10}>
            <Text style={[styles.switchIcon, { color: colors.text }]}>{resolved === 'dark' ? '☀️' : '🌙'}</Text>
          </Pressable>
          <View style={styles.langGroup}>
            {(['es', 'en', 'it'] as const).map((l) => (
              <Pressable key={l} onPress={() => setLang(l)} hitSlop={6}>
                <Text style={[styles.lang, { color: l === lang ? colors.accent : colors.muted,
                  fontFamily: l === lang ? fonts.sansBold : fonts.mono }]}>{l.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={[styles.welcome, { color: colors.text }]}>{t('welcome')} Aranha</Text>

        <HeroCard
          label={t('heroLabel')}
          title={t('heroTitle')}
          subtitle={t('heroSubtitle')}
          image="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200"
        />

        <Text style={[styles.section, { color: colors.text }]}>{t('todaysClasses')}</Text>
        {!hydrated ? (
          <EmptyState title={t('loading')} />
        ) : classes.length === 0 ? (
          <EmptyState title={t('noClasses')} subtitle={t('noClassesSub')} />
        ) : (
          <View style={styles.grid}>
            {classes.map((c) => (
              <View key={c.id} style={styles.cell}><CardWithCount session={c} /></View>
            ))}
          </View>
        )}

        <View style={[styles.tip, { borderColor: colors.border }]}>
          <Text style={[styles.tipText, { color: colors.muted }]}>
            <Text style={[styles.tipBold, { color: colors.text }]}>{t('proTipBold')}</Text>
            {t('proTip')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md },
  date: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  switchIcon: { fontSize: 20 },
  langGroup: { flexDirection: 'row', gap: spacing.sm },
  lang: { fontSize: 13 },
  welcome: { fontFamily: fonts.sansBlack, fontSize: 34 },
  section: { fontFamily: fonts.sansBold, fontSize: 22, marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { width: '47%', flexGrow: 1 },
  tip: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.card, padding: spacing.md, marginTop: spacing.sm },
  tipText: { fontFamily: fonts.sans, fontSize: 13, flex: 1 },
  tipBold: { fontFamily: fonts.sansSemi },
});
