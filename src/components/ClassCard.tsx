import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, fonts } from '../lib/theme';
import { TagPill } from './TagPill';
import { Avatar } from './Avatar';
import { formatTimeRange } from '../lib/dates';
import type { ClassSession } from '../lib/types';

export function ClassCard({ session, attendees }: { session: ClassSession; attendees: number }) {
  const { colors } = useTheme();
  return (
    <Link href={`/class/${session.id}`} asChild>
      <Pressable style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.headRow}>
          <Avatar name={session.instructor} size={40} />
          <View style={styles.headText}>
            <Text style={[styles.name, { color: colors.text }]}>{session.name}</Text>
            <Text style={[styles.time, { color: colors.muted }]}>{formatTimeRange(session.startTime, session.endTime)}</Text>
          </View>
        </View>
        <View style={styles.tags}>
          {session.tags.map((t) => <TagPill key={t} label={t} />)}
        </View>
        <View style={styles.footer}>
          <Text style={[styles.meta, { color: colors.muted }]}>{attendees}/{session.capacity}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{session.instructor}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.card, padding: spacing.md, gap: spacing.sm },
  headRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  headText: { flex: 1 },
  name: { fontFamily: fonts.sansBold, fontSize: 15 },
  time: { fontFamily: fonts.sans, fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { fontFamily: fonts.sans, fontSize: 12 },
});
