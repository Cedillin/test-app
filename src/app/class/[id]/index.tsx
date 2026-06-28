import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, fonts } from '../../../lib/theme';
import { useClass, useMember, useCheckIns } from '../../../context/CheckInContext';
import { mergeAttendees, attendeeCount } from '../../../lib/attendees';
import { formatTimeRange } from '../../../lib/dates';
import { TagPill } from '../../../components/TagPill';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { AttendeeRow } from '../../../components/AttendeeRow';
import { EmptyState } from '../../../components/EmptyState';

function Row({ memberId, status, at }: { memberId: string; status: 'registered' | 'confirmed'; at: string }) {
  const member = useMember(memberId);
  const name = member ? `${member.firstName} ${member.lastName}` : memberId;
  return <AttendeeRow name={name} uri={member?.profilePicture} status={status} at={at} />;
}

export default function ClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useClass(id);
  const checkins = useCheckIns(id);

  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Class" onBack={() => router.back()} />
        <EmptyState title="Class not found" />
      </SafeAreaView>
    );
  }

  const attendees = mergeAttendees(session.roster, checkins)
    .sort((a, b) => a.at.localeCompare(b.at));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={session.name} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.name}>{session.name}</Text>
        <Text style={styles.meta}>{formatTimeRange(session.startTime, session.endTime)} · {session.instructor}</Text>
        <View style={styles.tags}>{session.tags.map((t) => <TagPill key={t} label={t} />)}</View>
        <Text style={styles.count}>{attendeeCount(session.roster, checkins)}/{session.capacity} attendees</Text>

        <View style={styles.list}>
          {attendees.length === 0
            ? <EmptyState title="No attendees yet" subtitle="Be the first to check in." />
            : attendees.map((a) => <Row key={a.memberId} memberId={a.memberId} status={a.status} at={a.at} />)}
        </View>
      </ScrollView>
      <View style={styles.cta}>
        <PrimaryButton label="Find your name" onPress={() => router.push(`/class/${id}/search`)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  scroll: { gap: spacing.xs, paddingBottom: spacing.lg },
  name: { fontFamily: fonts.sansBold, fontSize: 26, color: colors.text },
  meta: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginVertical: spacing.sm },
  count: { fontFamily: fonts.sansMed, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  list: { gap: 2 },
  cta: { paddingVertical: spacing.md },
});
