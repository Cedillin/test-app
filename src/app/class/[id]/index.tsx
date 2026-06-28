import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { spacing, fonts, radius } from '../../../lib/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
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
  const { colors } = useTheme();
  const { t } = useI18n();
  const session = useClass(id);
  const checkins = useCheckIns(id);

  if (!session) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('classNotFound')} onBack={() => router.back()} />
        <EmptyState title={t('classNotFound')} />
      </SafeAreaView>
    );
  }

  const attendees = mergeAttendees(session.roster, checkins)
    .sort((a, b) => a.at.localeCompare(b.at));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={session.name} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.name, { color: colors.text }]}>{session.name}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>{formatTimeRange(session.startTime, session.endTime)} · {session.instructor}</Text>
        <View style={styles.tags}>{session.tags.map((tag) => <TagPill key={tag} label={tag} />)}</View>
        <Text style={[styles.count, { color: colors.text }]}>{attendeeCount(session.roster, checkins)}/{session.capacity} {t('attendees')}</Text>

        <View style={styles.list}>
          {attendees.length === 0
            ? <EmptyState title={t('noAttendees')} subtitle={t('noAttendeesSub')} />
            : attendees.map((a) => <Row key={a.memberId} memberId={a.memberId} status={a.status} at={a.at} />)}
        </View>
      </ScrollView>
      <View style={styles.cta}>
        <View style={{ flex: 1 }}>
          <PrimaryButton label={t('findYourName')} onPress={() => router.push(`/class/${id}/search`)} />
        </View>
        <Pressable
          style={[styles.scanBtn, { borderColor: colors.border }]}
          onPress={() => router.push(`/class/${id}/scan`)}
        >
          <Text style={[styles.scanLabel, { color: colors.text }]}>{t('scan')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  scroll: { gap: spacing.xs, paddingBottom: spacing.lg },
  name: { fontFamily: fonts.sansBold, fontSize: 26 },
  meta: { fontFamily: fonts.sans, fontSize: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginVertical: spacing.sm },
  count: { fontFamily: fonts.sansMed, fontSize: 14, marginBottom: spacing.sm },
  list: { gap: 2 },
  cta: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.md, alignItems: 'center' },
  scanBtn: { borderWidth: 1, borderRadius: radius.card, paddingVertical: spacing.md + 2, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  scanLabel: { fontFamily: fonts.sansSemi, fontSize: 18 },
});
