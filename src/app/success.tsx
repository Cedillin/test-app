import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { spacing, fonts } from '../lib/theme';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

const RESET_MS = 2500;

export default function SuccessScreen() {
  const { name, duplicate } = useLocalSearchParams<{ name?: string; duplicate?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/'), RESET_MS);
    return () => clearTimeout(timer); // cancel on manual navigation / unmount
  }, [router]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.topBar }]}>
      <MotiView
        from={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 180 }}
        style={styles.body}
      >
        <Text style={[styles.check, { color: colors.white }]}>✓</Text>
        <Text style={[styles.title, { color: colors.white }]}>
          {duplicate === '1' ? t('alreadyCheckedIn') : t('checkedIn')}
        </Text>
        <Text style={[styles.sub, { color: colors.white }]}>
          {name ? t('seeYouNamed', { name }) : t('seeYou')}
        </Text>
      </MotiView>
      <Text style={[styles.hint, { color: colors.white }]}>{t('returningToStart')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  body: { alignItems: 'center', gap: spacing.sm },
  check: { fontSize: 72, fontFamily: fonts.sansBold },
  title: { fontSize: 32, fontFamily: fonts.sansBold },
  sub: { fontSize: 16, opacity: 0.8, fontFamily: fonts.sans },
  hint: { position: 'absolute', bottom: spacing.xl, opacity: 0.5, fontFamily: fonts.mono, fontSize: 11 },
});
