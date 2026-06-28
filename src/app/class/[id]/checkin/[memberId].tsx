import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, fonts } from '../../../../lib/theme';
import { useMember, useClass, useCheckInActions } from '../../../../context/CheckInContext';
import { formatHeaderDate } from '../../../../lib/dates';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { EmptyState } from '../../../../components/EmptyState';

export default function CheckInScreen() {
  const { id, memberId } = useLocalSearchParams<{ id: string; memberId: string }>();
  const router = useRouter();
  const member = useMember(memberId);
  const session = useClass(id);
  const { checkIn } = useCheckInActions();

  if (!member || !session) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Check in" onBack={() => router.back()} />
        <EmptyState title="Member not found" />
      </SafeAreaView>
    );
  }

  const onCheckIn = () => {
    const res = checkIn(id, memberId);
    if (!res.ok && res.reason === 'duplicate') {
      router.replace({ pathname: '/success', params: { name: member.firstName, duplicate: '1' } });
      return;
    }
    router.replace({ pathname: '/success', params: { name: member.firstName } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={session.name} onBack={() => router.back()} />
      <View style={styles.body}>
        <Text style={styles.date}>{formatHeaderDate()}</Text>
        <Text style={styles.name}>{member.firstName} {member.lastName}</Text>
        <Text style={styles.sub}>{session.name} · {session.startTime}</Text>
      </View>
      <View style={styles.cta}><PrimaryButton label="Check In" onPress={onCheckIn} /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  date: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1, color: colors.muted },
  name: { fontFamily: fonts.sansBlack, fontSize: 34, color: colors.text, textAlign: 'center' },
  sub: { fontFamily: fonts.sans, fontSize: 16, color: colors.muted },
  cta: { paddingVertical: spacing.lg },
});
