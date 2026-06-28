import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, type Lang, type TKey } from '../i18n/translations';

const KEY = 'lang';
const isLang = (v: unknown): v is Lang => v === 'es' || v === 'en' || v === 'it';

function deviceLang(): Lang {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  return isLang(code) ? code : 'en';
}

const Ctx = createContext<{
  t: (key: TKey, vars?: Record<string, string>) => string; lang: Lang; setLang: (l: Lang) => void;
} | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceLang());

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (isLang(v)) setLangState(v); });
  }, []);

  const t = useCallback((key: TKey, vars?: Record<string, string>) => {
    let s: string = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
    return s;
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  }, []);

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('I18nProvider missing');
  return v;
}
