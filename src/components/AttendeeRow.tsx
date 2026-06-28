import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { spacing, radius, fonts } from '../lib/theme';
import { Avatar } from './Avatar';

export function AttendeeRow({ name, uri, status, at }:
  { name: string; uri?: string; status: 'registered' | 'confirmed'; at: string }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const time = new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const confirmed = status === 'confirmed';
  return (
    <View style={styles.row}>
      <Avatar name={name} uri={uri} size={40} />
      <View style={styles.text}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.time, { color: colors.muted }]}>{time}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: confirmed ? colors.successBg : colors.card }]}>
        <Text style={[styles.badgeText, { color: confirmed ? colors.success : colors.muted }]}>
          {confirmed ? t('confirmed') : t('registered')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  text: { flex: 1 },
  name: { fontFamily: fonts.sansMed, fontSize: 15 },
  time: { fontFamily: fonts.sans, fontSize: 12 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
});
