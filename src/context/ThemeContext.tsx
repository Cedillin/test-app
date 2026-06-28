import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type Palette } from '../lib/theme';

export type Mode = 'light' | 'dark' | 'system';
const KEY = 'theme_mode';

const Ctx = createContext<{
  colors: Palette; mode: Mode; resolved: 'light' | 'dark'; setMode: (m: Mode) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system: 'light' | 'dark' = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setModeState] = useState<Mode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
    });
  }, []);

  const resolved: 'light' | 'dark' = mode === 'system' ? system : mode;
  const colors = resolved === 'dark' ? darkColors : lightColors;
  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ colors, mode, resolved, setMode }),
    [colors, mode, resolved, setMode],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('ThemeProvider missing');
  return v;
}
