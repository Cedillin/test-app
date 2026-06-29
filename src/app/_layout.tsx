import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, useColorScheme, Platform, Pressable, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';
import {
  useFonts,
  Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_900Black,
} from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CheckInProvider } from '../context/CheckInContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { lightColors, darkColors } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

const DEVICES = [
  { key: 'mobile', label: 'Mobile', width: 390 },
  { key: 'tablet', label: 'Tablet', width: 834 },
  { key: 'desktop', label: 'Desktop', width: null },
] as const;
type DeviceKey = (typeof DEVICES)[number]['key'];

// Web-only demo wrapper: frames the kiosk at a chosen device width so the live
// demo reads like a real kiosk instead of a stretched page. No-op on native.
function WebDeviceFrame({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const [device, setDevice] = useState<DeviceKey>('tablet');
  const cfg = DEVICES.find((d) => d.key === device)!;
  return (
    <View style={webStyles.root}>
      <View style={webStyles.bar}>
        <Text style={webStyles.barLabel}>PREVIEW</Text>
        {DEVICES.map((d) => {
          const active = d.key === device;
          return (
            <Pressable
              key={d.key}
              onPress={() => setDevice(d.key)}
              style={[webStyles.tab, active && { backgroundColor: colors.accent }]}
            >
              <Text style={[webStyles.tabText, { color: active ? '#fff' : '#cfcfcf' }]}>{d.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={webStyles.stage}>
        <View
          style={[
            { flex: 1, backgroundColor: colors.background, width: '100%' },
            cfg.width != null && { width: cfg.width, maxWidth: '100%', borderRadius: 28, overflow: 'hidden', ...webStyles.deviceShadow },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

function ThemedStack() {
  const { colors, resolved } = useTheme();
  const content = (
    <>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="success" options={{ animation: 'fade' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
  if (Platform.OS !== 'web') return content;
  return <WebDeviceFrame>{content}</WebDeviceFrame>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_900Black,
    GeistMono_400Regular,
  });

  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) {
    const bg = colorScheme === 'dark' ? darkColors.background : lightColors.background;
    return <View style={[styles.center, { backgroundColor: bg }]}><ActivityIndicator /></View>;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <CheckInProvider>
            <ThemedStack />
          </CheckInProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

const webStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0c' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0b0b0c' },
  barLabel: { color: '#6b6b6b', fontFamily: 'GeistMono_400Regular', fontSize: 10, letterSpacing: 1.5, marginRight: 4 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#1c1c1e' },
  tabText: { fontFamily: 'Geist_500Medium', fontSize: 13 },
  stage: { flex: 1, alignItems: 'center', paddingBottom: 16, paddingHorizontal: 16 },
  deviceShadow: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
});
