import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, fonts } from '../lib/theme';
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
  const hydrated = useHydrated();
  const classes = useClasses();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.date}>{formatHeaderDate()}</Text>
        <Text style={styles.welcome}>Welcome to Aranha</Text>

        <HeroCard
          label="EXPERIENCES"
          title="Summer BJJ Bootcamp"
          subtitle="Roll more, learn more, sweat more. Summer starts on the mat."
          image="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200"
        />

        <Text style={styles.section}>Today's classes</Text>
        {!hydrated ? (
          <EmptyState title="Loading…" />
        ) : classes.length === 0 ? (
          <EmptyState title="No classes today" subtitle="Check back later." />
        ) : (
          <View style={styles.grid}>
            {classes.map((c) => (
              <View key={c.id} style={styles.cell}><CardWithCount session={c} /></View>
            ))}
          </View>
        )}

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Pro tip. </Text>
            Open your MAAT app and bump this device, you will be checked in automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md },
  date: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.muted },
  welcome: { fontFamily: fonts.sansBlack, fontSize: 34, color: colors.text },
  section: { fontFamily: fonts.sansBold, fontSize: 22, color: colors.text, marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { width: '47%', flexGrow: 1 },
  tip: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.md, marginTop: spacing.sm },
  tipText: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, flex: 1 },
  tipBold: { fontFamily: fonts.sansSemi, color: colors.text },
});
