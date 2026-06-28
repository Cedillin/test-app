import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
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

function ThemedStack() {
  const { colors, resolved } = useTheme();
  return (
    <>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="success" options={{ animation: 'fade' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
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
