import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors, radius, spacing, fonts } from '../lib/theme';
import { TagPill } from './TagPill';
import { Avatar } from './Avatar';
import { formatTimeRange } from '../lib/dates';
import type { ClassSession } from '../lib/types';

export function ClassCard({ session, attendees }: { session: ClassSession; attendees: number }) {
  return (
    <Link href={`/class/${session.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.headRow}>
          <Avatar name={session.instructor} size={40} />
          <View style={styles.headText}>
            <Text style={styles.name}>{session.name}</Text>
            <Text style={styles.time}>{formatTimeRange(session.startTime, session.endTime)}</Text>
          </View>
        </View>
        <View style={styles.tags}>
          {session.tags.map((t) => <TagPill key={t} label={t} />)}
        </View>
        <View style={styles.footer}>
          <Text style={styles.meta}>{attendees}/{session.capacity} attendees</Text>
          <Text style={styles.meta}>{session.instructor}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.card, padding: spacing.md, gap: spacing.sm },
  headRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  headText: { flex: 1 },
  name: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.text },
  time: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
});
