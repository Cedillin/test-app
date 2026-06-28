import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const router = useRouter();
  const hydrated = useHydrated();
  const classes = useClasses();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <Text style={[styles.date, { color: colors.muted }]}>{formatHeaderDate(new Date(), lang)}</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={10}
            accessibilityLabel={t('settings')}
            style={[styles.gear, { backgroundColor: colors.card }]}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.welcomeRow}>
          <Text style={[styles.welcome, { color: colors.text }]}>{t('welcome')} </Text>
          <View style={[styles.logo, { backgroundColor: colors.text }]}>
            <MaterialCommunityIcons name="spider" size={17} color={colors.background} />
          </View>
          <Text style={[styles.welcome, { color: colors.text }]}> Aranha</Text>
        </View>

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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1 },
  gear: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  welcomeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: spacing.xs },
  welcome: { fontFamily: fonts.sansBold, fontSize: 30, letterSpacing: -0.5, lineHeight: 36 },
  logo: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  section: { fontFamily: fonts.sansBold, fontSize: 22, marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { width: '47%', flexGrow: 1 },
  tip: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.card, padding: spacing.md, marginTop: spacing.sm },
  tipText: { fontFamily: fonts.sans, fontSize: 13, flex: 1 },
  tipBold: { fontFamily: fonts.sansSemi },
});
