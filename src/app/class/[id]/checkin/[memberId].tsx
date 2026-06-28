import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { spacing, fonts } from '../../../../lib/theme';
import { useTheme } from '../../../../context/ThemeContext';
import { useI18n } from '../../../../context/I18nContext';
import { useMember, useClass, useCheckInActions } from '../../../../context/CheckInContext';
import { formatHeaderDate } from '../../../../lib/dates';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { EmptyState } from '../../../../components/EmptyState';

export default function CheckInScreen() {
  const { id, memberId } = useLocalSearchParams<{ id: string; memberId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const member = useMember(memberId);
  const session = useClass(id);
  const { checkIn } = useCheckInActions();

  if (!member || !session) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('checkIn')} onBack={() => router.back()} />
        <EmptyState title={!member ? t('memberNotFound') : t('classNotFound')} />
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={session.name} onBack={() => router.back()} />
      <View style={styles.body}>
        <Text style={[styles.date, { color: colors.muted }]}>{formatHeaderDate(new Date(), lang)}</Text>
        <Text style={[styles.name, { color: colors.text }]}>{member.firstName} {member.lastName}</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>{session.name} · {session.startTime}</Text>
      </View>
      <View style={styles.cta}><PrimaryButton label={t('checkIn')} onPress={onCheckIn} /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  date: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1 },
  name: { fontFamily: fonts.sansBlack, fontSize: 34, textAlign: 'center' },
  sub: { fontFamily: fonts.sans, fontSize: 16 },
  cta: { paddingVertical: spacing.lg },
});
