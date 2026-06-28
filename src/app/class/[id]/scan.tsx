import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { useMembers, useCheckInActions } from '../../../context/CheckInContext';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { fonts, spacing } from '../../../lib/theme';

export default function ScanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const members = useMembers();
  const { checkIn } = useCheckInActions();
  const [permission, requestPermission] = useCameraPermissions();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission]);

  const onScan = ({ data }: { data: string }) => {
    if (handled) return;
    setHandled(true);
    // mock payload: the QR encodes a raw memberId (e.g. "m1")
    const member = members.find((m) => m.id === data.trim());
    if (!member) { setHandled(false); return; } // ignore unknown codes, keep scanning
    const res = checkIn(id, member.id);
    router.replace({ pathname: '/success', params: { name: member.firstName, ...(res.ok ? {} : { duplicate: '1' }) } });
  };

  if (!permission) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('scanTitle')} onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={[styles.msg, { color: colors.text }]}>{t('cameraDenied')}</Text>
          <PrimaryButton label={t('useSearchInstead')} onPress={() => router.replace(`/class/${id}/search`)} />
          {!permission.canAskAgain ? null : (
            <Text onPress={requestPermission} style={[styles.link, { color: colors.accent }]}>{t('enableCamera')}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('scanTitle')} onBack={() => router.back()} />
      <CameraView style={styles.camera} facing="front"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScan} />
      <Text style={[styles.prompt, { color: colors.muted }]}>{t('scanPrompt')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  camera: { flex: 1, borderRadius: 16, overflow: 'hidden', marginVertical: spacing.md },
  prompt: { fontFamily: fonts.sans, fontSize: 14, textAlign: 'center', marginBottom: spacing.lg },
  msg: { fontFamily: fonts.sansSemi, fontSize: 18 },
  link: { fontFamily: fonts.sansMed, fontSize: 15 },
});
