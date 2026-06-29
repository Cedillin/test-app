import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../lib/theme';

const PALETTE = ['#2563EB', '#DB2777', '#EA580C', '#16A34A', '#7C3AED', '#0891B2'];

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % PALETTE.length;
  return PALETTE[h];
}

export function Avatar({ uri, name, size = 44 }: { uri?: string; name: string; size?: number }) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (uri && !failed) {
    return <Image source={{ uri }} style={[dim, { backgroundColor: colors.card }]} contentFit="cover" cachePolicy="memory-disk" transition={150} onError={() => setFailed(true)} />;
  }
  return (
    <View style={[styles.fallback, dim, { backgroundColor: colorFor(name) }]}>
      <Text style={[styles.initials, { fontSize: size * 0.38, color: colors.white }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.sansSemi },
});
