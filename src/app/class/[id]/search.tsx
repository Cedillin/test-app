import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { spacing, fonts } from '../../../lib/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { useMembers } from '../../../context/CheckInContext';
import { SearchBar } from '../../../components/SearchBar';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { EmptyState } from '../../../components/EmptyState';
import { Avatar } from '../../../components/Avatar';

export default function SearchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const members = useMembers();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((m) => `${m.firstName} ${m.lastName}`.toLowerCase().includes(needle));
  }, [q, members]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('findYourName')} onBack={() => router.back()} />
      <View style={styles.search}><SearchBar value={q} onChangeText={setQ} placeholder={t('searchPlaceholder')} /></View>
      <FlatList
        data={results}
        keyExtractor={(m) => m.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyState title={t('noResults')} subtitle={t('noResultsSub', { q })} />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/class/${id}/checkin/${item.id}`)}>
            <Avatar name={`${item.firstName} ${item.lastName}`} uri={item.profilePicture} size={44} />
            <Text style={[styles.name, { color: colors.text }]}>{item.firstName} {item.lastName}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  search: { paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  name: { fontFamily: fonts.sansMed, fontSize: 18 },
});
