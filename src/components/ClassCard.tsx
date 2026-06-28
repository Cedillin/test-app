import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { radius, spacing, fonts } from '../lib/theme';
import { TagPill } from './TagPill';
import { Avatar } from './Avatar';
import { formatTimeRange } from '../lib/dates';
import type { ClassSession } from '../lib/types';

export function ClassCard({ session, attendees }: { session: ClassSession; attendees: number }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <Link href={`/class/${session.id}`} asChild>
      <Pressable style={StyleSheet.flatten([styles.card, { backgroundColor: colors.card }])}>
        <View style={styles.headRow}>
          <Avatar uri={`https://i.pravatar.cc/96?u=${encodeURIComponent(session.instructor)}`} name={session.instructor} size={40} />
          <View style={styles.headText}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{session.name}</Text>
            <Text style={[styles.time, { color: colors.muted }]}>{formatTimeRange(session.startTime, session.endTime)}</Text>
            <View style={styles.tags}>
              {session.tags.map((tag) => <TagPill key={tag} label={tag} />)}
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.footItem}>
            <Ionicons name="people-outline" size={14} color={colors.muted} />
            <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>{attendees}/{session.capacity} {t('attendees')}</Text>
          </View>
          <View style={styles.footItem}>
            <Ionicons name="person-outline" size={14} color={colors.muted} />
            <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>{session.instructor}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 184, borderRadius: radius.card, padding: spacing.md, justifyContent: 'space-between', gap: spacing.md },
  headRow: { flexDirection: 'row', gap: spacing.sm },
  headText: { flex: 1, gap: 3 },
  name: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 19 },
  time: { fontFamily: fonts.sans, fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.xs },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  footItem: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  meta: { fontFamily: fonts.sans, fontSize: 12, flexShrink: 1 },
});
