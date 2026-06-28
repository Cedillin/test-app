import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, fonts } from '../lib/theme';

const RESET_MS = 2500;

export default function SuccessScreen() {
  const { name, duplicate } = useLocalSearchParams<{ name?: string; duplicate?: string }>();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/'), RESET_MS);
    return () => clearTimeout(t); // cancel on manual navigation / unmount
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.title}>
          {duplicate === '1' ? 'Already checked in' : 'Checked in!'}
        </Text>
        <Text style={styles.sub}>
          {name ? `See you on the mat, ${name}.` : 'See you on the mat.'}
        </Text>
      </View>
      <Text style={styles.hint}>Returning to start…</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  body: { alignItems: 'center', gap: spacing.sm },
  check: { fontSize: 72, color: colors.white, fontFamily: fonts.sansBold },
  title: { fontSize: 32, color: colors.white, fontFamily: fonts.sansBold },
  sub: { fontSize: 16, color: colors.white, opacity: 0.8, fontFamily: fonts.sans },
  hint: { position: 'absolute', bottom: spacing.xl, color: colors.white, opacity: 0.5, fontFamily: fonts.mono, fontSize: 11 },
});
