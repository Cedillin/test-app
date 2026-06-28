# Gym Kiosk — Phase 2 Implementation Plan (theming · i18n · QR · animations · tests)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add light/dark theming, i18n (es/en/it), QR check-in (mock), animations, and integration tests to the working MAAT Gym Kiosk app.

**Architecture:** Two new React contexts — `ThemeProvider` (resolves light/dark from a persisted mode + system) and `I18nProvider` (persisted language, default from device locale). Components keep static `StyleSheet` for layout and apply **color inline** via `useTheme().colors`; all user-facing strings go through `t()`. QR uses `expo-camera` on a class-scoped route. Animations use `moti`/`reanimated` (needs `babel.config.js`). Integration tests use `@testing-library/react-native` wrapping all providers.

**Tech Stack:** Expo SDK 56, expo-router, expo-camera, expo-localization, moti, react-native-reanimated (installed), @testing-library/react-native.

## Global Constraints

- Branch: `feat/phase2`. Source under `src/`. Commit per task; stage only the task's files (no `git add -A`).
- Theming: `StyleSheet.create` stays for layout/spacing; **only color** comes from `useTheme().colors` applied inline (`style={[styles.x, { color: colors.text }]}`). Never hardcode palette hex in components (tag pill colors via `tagStyle` are allowed to stay static).
- i18n: every user-facing string via `t('key')`. Member/class DATA (names, instructor, tags) is NOT translated. Languages: `es`, `en`, `it`. Default language from `expo-localization` (fallback `en`); persisted.
- Persistence keys: theme `theme_mode` (`light|dark|system`), language `lang` (`es|en|it`). Reuse the existing AsyncStorage.
- Provider order in root layout: `SafeAreaProvider > ThemeProvider > I18nProvider > CheckInProvider > Stack`.
- Headless verification only: `npm run typecheck`, `npm test`, `npx expo export --platform ios`. The QR camera CANNOT be tested headless — verify it bundles; real-device test is the user's.
- Keep the existing 17 unit tests green; new integration tests add to that count.

---

### Task 1: Foundations — deps, babel, theme palettes, ThemeProvider, i18n, I18nProvider, wire root

**Files:**
- Create: `babel.config.js`, `src/context/ThemeContext.tsx`, `src/i18n/translations.ts`, `src/context/I18nContext.tsx`
- Modify: `src/lib/theme.ts` (palettes), `src/app/_layout.tsx` (wire providers), `app.json` (expo-camera/localization plugins)

**Interfaces produced:**
- `lightColors`, `darkColors`, type `Palette` from `src/lib/theme.ts` (keeps `spacing`, `radius`, `fonts`, `tagStyle`).
- `ThemeProvider`, `useTheme(): { colors: Palette; mode: Mode; resolved: 'light'|'dark'; setMode(m: Mode): void }`, type `Mode = 'light'|'dark'|'system'`.
- `translations`, type `Lang = 'es'|'en'|'it'`, type `TKey` from `src/i18n/translations.ts`.
- `I18nProvider`, `useI18n(): { t(key: TKey, vars?: Record<string,string>): string; lang: Lang; setLang(l: Lang): void }`.

- [ ] **Step 1: Install deps + create babel.config**

```bash
npx expo install expo-camera expo-localization moti
npm install -D @testing-library/react-native
```

Create `babel.config.js` (worklets plugin MUST be last; required by reanimated/moti):

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

- [ ] **Step 2: Refactor `src/lib/theme.ts` to light/dark palettes**

Replace the single `colors` export with two palettes of identical shape and a `Palette` type. Keep `spacing`, `radius`, `fonts`, and `tagStyle` exactly as they are (tag pill colors stay static across themes).

```ts
export type Palette = {
  background: string; card: string; text: string; muted: string; topBar: string;
  accent: string; white: string; border: string; success: string; successBg: string;
  tagDefault: { bg: string; fg: string };
};

export const lightColors: Palette = {
  background: '#FFFFFF', card: '#F4F4F5', text: '#0A0A0A', muted: '#737373', topBar: '#1A1A1A',
  accent: '#2563EB', white: '#FFFFFF', border: '#E5E5E5', success: '#16A34A', successBg: '#DCFCE7',
  tagDefault: { bg: '#F4F4F5', fg: '#525252' },
};

export const darkColors: Palette = {
  background: '#0A0A0A', card: '#1A1A1A', text: '#FAFAFA', muted: '#A3A3A3', topBar: '#000000',
  accent: '#3B82F6', white: '#FFFFFF', border: '#262626', success: '#22C55E', successBg: '#14532D',
  tagDefault: { bg: '#262626', fg: '#A3A3A3' },
};
```

Keep the existing `TAGS`, `tagStyle`, `spacing`, `radius`, `fonts`. Update `tagStyle`'s fallback to `lightColors.tagDefault` (or keep a literal) so it stays a pure function. The old `theme.test.ts` checks `colors.background` / `colors.accent` / `tagStyle` — update it to import `lightColors` and assert `lightColors.background === '#FFFFFF'`, `lightColors.accent === '#2563EB'`, plus the existing `tagStyle` cases.

- [ ] **Step 3: Write `src/context/ThemeContext.tsx`**

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type Palette } from '../lib/theme';

export type Mode = 'light' | 'dark' | 'system';
const KEY = 'theme_mode';

const Ctx = createContext<{
  colors: Palette; mode: Mode; resolved: 'light' | 'dark'; setMode: (m: Mode) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme() ?? 'light';
  const [mode, setModeState] = useState<Mode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
    });
  }, []);

  const resolved: 'light' | 'dark' = mode === 'system' ? system : mode;
  const colors = resolved === 'dark' ? darkColors : lightColors;
  const setMode = (m: Mode) => { setModeState(m); AsyncStorage.setItem(KEY, m).catch(() => {}); };

  return <Ctx.Provider value={{ colors, mode, resolved, setMode }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('ThemeProvider missing');
  return v;
}
```

- [ ] **Step 4: Write `src/i18n/translations.ts`** (full strings; no placeholders)

```ts
export const translations = {
  en: {
    welcome: 'Welcome to', todaysClasses: 'Today’s classes', attendees: 'attendees',
    heroLabel: 'EXPERIENCES', heroTitle: 'Summer BJJ Bootcamp',
    heroSubtitle: 'Roll more, learn more, sweat more. Summer starts on the mat.',
    proTipBold: 'Pro tip. ', proTip: 'Open your MAAT app and bump this device, you will be checked in automatically.',
    loading: 'Loading…', noClasses: 'No classes today', noClassesSub: 'Check back later.',
    findYourName: 'Find your name', scan: 'Scan',
    noAttendees: 'No attendees yet', noAttendeesSub: 'Be the first to check in.',
    confirmed: 'Confirmed', registered: 'Registered',
    classNotFound: 'Class not found', memberNotFound: 'Member not found', back: 'Back',
    searchPlaceholder: 'Search your name…', noResults: 'No results', noResultsSub: 'No member matches “{q}”.',
    checkIn: 'Check In', checkedIn: 'Checked in!', alreadyCheckedIn: 'Already checked in',
    seeYou: 'See you on the mat.', seeYouNamed: 'See you on the mat, {name}.', returningToStart: 'Returning to start…',
    scanTitle: 'Scan to check in', scanPrompt: 'Point the camera at your member QR.',
    cameraDenied: 'Camera permission denied', useSearchInstead: 'Use manual search instead',
    unknownMember: 'Unknown member code',
  },
  es: {
    welcome: 'Bienvenido a', todaysClasses: 'Clases de hoy', attendees: 'asistentes',
    heroLabel: 'EXPERIENCIAS', heroTitle: 'Summer BJJ Bootcamp',
    heroSubtitle: 'Rueda más, aprende más, suda más. El verano empieza en el tatami.',
    proTipBold: 'Truco. ', proTip: 'Abre tu app MAAT y acerca este dispositivo: se hará el check-in automáticamente.',
    loading: 'Cargando…', noClasses: 'No hay clases hoy', noClassesSub: 'Vuelve más tarde.',
    findYourName: 'Busca tu nombre', scan: 'Escanear',
    noAttendees: 'Aún no hay asistentes', noAttendeesSub: 'Sé el primero en registrarte.',
    confirmed: 'Confirmado', registered: 'Registrado',
    classNotFound: 'Clase no encontrada', memberNotFound: 'Socio no encontrado', back: 'Atrás',
    searchPlaceholder: 'Busca tu nombre…', noResults: 'Sin resultados', noResultsSub: 'Ningún socio coincide con «{q}».',
    checkIn: 'Hacer check-in', checkedIn: '¡Check-in hecho!', alreadyCheckedIn: 'Ya tienes el check-in',
    seeYou: 'Nos vemos en el tatami.', seeYouNamed: 'Nos vemos en el tatami, {name}.', returningToStart: 'Volviendo al inicio…',
    scanTitle: 'Escanea para hacer check-in', scanPrompt: 'Apunta la cámara a tu QR de socio.',
    cameraDenied: 'Permiso de cámara denegado', useSearchInstead: 'Usar la búsqueda manual',
    unknownMember: 'Código de socio desconocido',
  },
  it: {
    welcome: 'Benvenuto a', todaysClasses: 'Lezioni di oggi', attendees: 'partecipanti',
    heroLabel: 'ESPERIENZE', heroTitle: 'Summer BJJ Bootcamp',
    heroSubtitle: 'Rotola di più, impara di più, suda di più. L’estate inizia sul tatami.',
    proTipBold: 'Consiglio. ', proTip: 'Apri la tua app MAAT e avvicina questo dispositivo: il check-in sarà automatico.',
    loading: 'Caricamento…', noClasses: 'Nessuna lezione oggi', noClassesSub: 'Riprova più tardi.',
    findYourName: 'Trova il tuo nome', scan: 'Scansiona',
    noAttendees: 'Ancora nessun partecipante', noAttendeesSub: 'Sii il primo a fare check-in.',
    confirmed: 'Confermato', registered: 'Registrato',
    classNotFound: 'Lezione non trovata', memberNotFound: 'Socio non trovato', back: 'Indietro',
    searchPlaceholder: 'Cerca il tuo nome…', noResults: 'Nessun risultato', noResultsSub: 'Nessun socio corrisponde a «{q}».',
    checkIn: 'Fai check-in', checkedIn: 'Check-in fatto!', alreadyCheckedIn: 'Check-in già effettuato',
    seeYou: 'Ci vediamo sul tatami.', seeYouNamed: 'Ci vediamo sul tatami, {name}.', returningToStart: 'Ritorno alla home…',
    scanTitle: 'Scansiona per il check-in', scanPrompt: 'Inquadra il QR del socio.',
    cameraDenied: 'Permesso fotocamera negato', useSearchInstead: 'Usa la ricerca manuale',
    unknownMember: 'Codice socio sconosciuto',
  },
} as const;

export type Lang = keyof typeof translations;
export type TKey = keyof typeof translations['en'];
export const LANGS: Lang[] = ['es', 'en', 'it'];
```

- [ ] **Step 5: Write `src/context/I18nContext.tsx`**

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const t = (key: TKey, vars?: Record<string, string>) => {
    let s: string = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  };
  const setLang = (l: Lang) => { setLangState(l); AsyncStorage.setItem(KEY, l).catch(() => {}); };

  return <Ctx.Provider value={{ t, lang, setLang }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('I18nProvider missing');
  return v;
}
```

- [ ] **Step 6: Wire providers + plugins**

In `src/app/_layout.tsx`, wrap: `SafeAreaProvider > ThemeProvider > I18nProvider > CheckInProvider > Stack`. The `Stack`'s `contentStyle` background should read from `useTheme()` — extract an inner component (e.g. `<ThemedStack/>`) that calls `useTheme()` for the background color, since `useTheme` must be called under `ThemeProvider`. In `app.json` add the config plugins array entries: `"expo-camera"` (with a camera permission text) and `"expo-localization"`.

- [ ] **Step 7: Verify + commit**

Run: `npm run typecheck` (0 errors), `npm test` (theme test updated; full suite green). Note: screens still import the old `colors` — they break typecheck until Task 4. **To keep Task 1 self-contained, also do a minimal compat shim:** keep a `export const colors = lightColors;` in `theme.ts` so existing screens/components still typecheck until they're converted in Tasks 3–4. Remove the shim at the end of Task 4.
Commit: `git add babel.config.js src/lib/theme.ts src/lib/__tests__/theme.test.ts src/context/ThemeContext.tsx src/i18n/translations.ts src/context/I18nContext.tsx src/app/_layout.tsx app.json && git commit -m "feat(phase2): theme palettes + ThemeProvider + i18n (es/en/it) + providers"`

---

### Task 2: Locale-aware dates

**Files:** Modify `src/lib/dates.ts`, `src/lib/__tests__/dates.test.ts`

**Interfaces:** `formatHeaderDate(d: Date, lang?: 'es'|'en'|'it')` and `formatTimeRange` unchanged signature-wise (timeRange stays `10:00—11:00h`). `todayIso`, `normalizeToToday` unchanged.

- [ ] **Step 1: Add locale day/month tables + lang param to `formatHeaderDate`**

Keep `todayIso`, `formatTimeRange`, `normalizeToToday`. Replace `formatHeaderDate` with a locale-aware version. English keeps ordinals + uppercase (`MONDAY, 1ST JUNE`); Spanish/Italian use `DAY, N MONTH` uppercase, no ordinal (`LUNES, 1 DE JUNIO` / `LUNEDÌ, 1 GIUGNO`).

```ts
const DAYS = {
  en: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'],
  es: ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'],
  it: ['DOMENICA','LUNEDÌ','MARTEDÌ','MERCOLEDÌ','GIOVEDÌ','VENERDÌ','SABATO'],
};
const MONTHS = {
  en: ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'],
  es: ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'],
  it: ['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO','LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'],
};
function ordinal(n: number): string {
  const s = ['TH','ST','ND','RD']; const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
export function formatHeaderDate(d: Date = new Date(), lang: 'es'|'en'|'it' = 'en'): string {
  const day = DAYS[lang][d.getDay()]; const month = MONTHS[lang][d.getMonth()];
  if (lang === 'en') return `${day}, ${ordinal(d.getDate())} ${month}`;
  if (lang === 'es') return `${day}, ${d.getDate()} DE ${month}`;
  return `${day}, ${d.getDate()} ${month}`; // it
}
```

- [ ] **Step 2: Update test**

Keep the existing `todayIso`/`formatTimeRange`/`normalizeToToday` tests. Update the header tests to pass a lang and assert all three: `formatHeaderDate(new Date(2026,5,1),'en') === 'MONDAY, 1ST JUNE'`, `…'es') === 'LUNES, 1 DE JUNIO'`, `…'it') === 'LUNEDÌ, 1 GIUGNO'`. Also keep the ordinal 11/12/13 English case.

- [ ] **Step 3: Verify + commit** — `npm test -- dates`, `npm run typecheck`. Commit `src/lib/dates.ts` + test.

---

### Task 3: Convert the 9 components to `useTheme` + `t()`

**Files:** Modify all of `src/components/*.tsx`.

**Pattern (apply to each):**
1. Add `import { useTheme } from '../context/ThemeContext';` and, where the component renders user-facing text, `import { useI18n } from '../context/I18nContext';`.
2. Inside the component: `const { colors } = useTheme();` (+ `const { t } = useI18n();` if needed).
3. Keep the `StyleSheet.create` block for layout/spacing/fontFamily/fontSize. Remove color keys from the static styles and apply them inline: `style={[styles.x, { color: colors.text }]}`, `backgroundColor: colors.card`, `borderColor: colors.border`, etc.
4. Replace literal user-facing strings with `t('key')`.

**Per-component notes:**
- `Avatar.tsx`: `colors.card` (img bg), `colors.white` (initials). Keep PALETTE (initials bg colors) static. No text strings.
- `TagPill.tsx`: no theme needed for tag colors (`tagStyle` stays); the label is data (tag name) — leave as-is. (Skip unless it references `colors`.)
- `PrimaryButton.tsx`: `backgroundColor: colors.text`, label `colors.white`. The `label` prop is passed by callers (already `t()`'d there) — no change here.
- `ScreenHeader.tsx`: `colors.accent` (back), `colors.text` (title). Replace the literal `'‹ Back'` → `‹ ${t('back')}` (keep the chevron).
- `EmptyState.tsx`: `colors.text`, `colors.muted`. Title/subtitle are props (callers pass `t()`).
- `SearchBar.tsx`: `colors.card` bg, `colors.text` input, `colors.muted` placeholderTextColor. `placeholder` prop default → caller passes `t('searchPlaceholder')`; keep the prop.
- `ClassCard.tsx`: `colors.card`, `colors.text`, `colors.muted`. The `attendees`/`name`/time are data + a count; the literal word "attendees" lives on the screen (Home), not here — ClassCard receives a prebuilt string OR keep showing `{attendees}/{capacity}` and let Home pass the label. Simplest: ClassCard keeps the number+capacity; the word "attendees" is rendered by the caller. If ClassCard currently hardcodes "attendees", move that label to come from a prop or `useI18n` here.
- `HeroCard.tsx`: text is white-on-image (`colors.white`); label/title/subtitle are props (Home passes `t()`).
- `AttendeeRow.tsx`: `colors.successBg`/`colors.success` (confirmed), `colors.card`/`colors.muted` (registered), `colors.text`. Replace `'Confirmed'`/`'Registered'` → `t('confirmed')`/`t('registered')` via `useI18n` here.

- [ ] **Step 1:** Convert each component per the pattern + notes above.
- [ ] **Step 2: Verify** — `npm run typecheck` (0 errors), `npm test` (17 unit still green). No simulator.
- [ ] **Step 3: Commit** — `git add src/components && git commit -m "feat(phase2): theme + i18n in UI components"`

---

### Task 4: Convert the 5 screens + add the theme/language switcher on Home

**Files:** Modify `src/app/index.tsx`, `src/app/class/[id]/index.tsx`, `src/app/class/[id]/search.tsx`, `src/app/class/[id]/checkin/[memberId].tsx`, `src/app/success.tsx`. Then remove the `colors` compat shim from `src/lib/theme.ts`.

**Pattern:** same as Task 3 — `useTheme()` for colors inline, `useI18n()` for `t()`. Use the i18n keys from `translations.ts`. For interpolation: `t('noResultsSub', { q })`, `t('seeYouNamed', { name })`. For Home's date use `formatHeaderDate(new Date(), lang)`. For the attendee count line use `{count}/{capacity} {t('attendees')}`.

**Switcher UI (Home):** add a compact control row near the top of Home (below the date or in a header strip):
```tsx
// inside Home, after const { colors } = useTheme(); const { t, lang, setLang } = useI18n(); const { resolved, setMode } = useTheme();
<View style={styles.switchRow}>
  <Pressable onPress={() => setMode(resolved === 'dark' ? 'light' : 'dark')} hitSlop={10}>
    <Text style={[styles.switchIcon, { color: colors.text }]}>{resolved === 'dark' ? '☀️' : '🌙'}</Text>
  </Pressable>
  <View style={styles.langGroup}>
    {(['es','en','it'] as const).map((l) => (
      <Pressable key={l} onPress={() => setLang(l)} hitSlop={6}>
        <Text style={[styles.lang, { color: l === lang ? colors.accent : colors.muted,
          fontFamily: l === lang ? fonts.sansBold : fonts.mono }]}>{l.toUpperCase()}</Text>
      </Pressable>
    ))}
  </View>
</View>
```
Add styles `switchRow` (row, space-between, alignItems center, marginBottom spacing.sm), `switchIcon` (fontSize 20), `langGroup` (row, gap spacing.sm), `lang` (mono, fontSize 13).

**Class screen:** add a **"Scan" secondary button** next to "Find your name" that routes to `/class/${id}/scan` (the route Task 6 creates). Use a bordered/secondary style (border `colors.border`, text `colors.text`).

- [ ] **Step 1:** Convert each screen; replace all literal strings with `t()`; wire the switcher on Home; add the Scan button on Class.
- [ ] **Step 2:** Remove `export const colors = lightColors;` shim from `theme.ts` (everything now uses `useTheme`). `grep -rn "from '.*theme'" src | grep -i "colors"` should show only `lightColors`/`darkColors`/`Palette`/`tagStyle`/`spacing`/`radius`/`fonts` imports — no bare `colors`.
- [ ] **Step 3: Verify** — `npm run typecheck` (0 errors), `npm test` (17 green), `npx expo export --platform ios` (exit 0 — proves the themed/i18n app bundles). 
- [ ] **Step 4: Commit** — `git add src/app src/lib/theme.ts && git commit -m "feat(phase2): theme + i18n + dark/light & language switcher across screens"`

---

### Task 5: Animations (moti)

**Files:** Modify `src/app/success.tsx` (success pop), `src/app/_layout.tsx` (screen transition via Stack animation).

- [ ] **Step 1: Success "pop"** — wrap the checkmark + title in a `moti` view that springs in:
```tsx
import { MotiView } from 'moti';
// ...
<MotiView from={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', damping: 12, stiffness: 180 }} style={styles.body}>
  <Text style={styles.check}>✓</Text>
  <Text style={styles.title}>{duplicate === '1' ? t('alreadyCheckedIn') : t('checkedIn')}</Text>
  <Text style={styles.sub}>{name ? t('seeYouNamed', { name }) : t('seeYou')}</Text>
</MotiView>
```
- [ ] **Step 2: Screen transitions** — in `_layout.tsx` set `screenOptions={{ ..., animation: 'slide_from_right' }}` on the Stack (success can use `animation: 'fade'` via a per-screen `<Stack.Screen name="success" options={{ animation:'fade' }} />` if desired). Keep it minimal.
- [ ] **Step 3: Verify** — `npm run typecheck`, `npm test` (green), `npx expo export --platform ios` (exit 0 — proves reanimated/worklets babel plugin works). If export fails on a worklets/reanimated error, the babel.config from Task 1 is the fix to check.
- [ ] **Step 4: Commit** — `git add src/app/success.tsx src/app/_layout.tsx && git commit -m "feat(phase2): success spring animation + screen transitions"`

---

### Task 6: QR check-in (class-scoped, mock)

**Files:** Create `src/app/class/[id]/scan.tsx`. (Scan button added in Task 4.) Modify `app.json` if camera permission not already added in Task 1.

- [ ] **Step 1: Write `src/app/class/[id]/scan.tsx`**

```tsx
import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { useMembers, useCheckInActions } from '../../../context/CheckInContext';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { fonts, spacing } from '../../../lib/theme';

export default function ScanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const members = useMembers();
  const { checkIn } = useCheckInActions();
  const [permission, requestPermission] = useCameraPermissions();
  const [handled, setHandled] = useState(false);

  const onScan = ({ data }: { data: string }) => {
    if (handled) return;
    setHandled(true);
    // mock payload: the QR encodes a raw memberId (e.g. "m1")
    const member = members.find((m) => m.id === data.trim());
    if (!member) { setHandled(false); return; } // ignore unknown codes, keep scanning
    const res = checkIn(id, member.id);
    router.replace({ pathname: '/success', params: { name: member.firstName, ...(res.ok ? {} : { duplicate: '1' }) } });
  };

  if (!permission) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('scanTitle')} onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={[styles.msg, { color: colors.text }]}>{t('cameraDenied')}</Text>
          <PrimaryButton label={t('useSearchInstead')} onPress={() => router.replace(`/class/${id}/search`)} />
          {!permission.canAskAgain ? null : (
            <Text onPress={requestPermission} style={[styles.link, { color: colors.accent }]}>{t('scan')}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('scanTitle')} onBack={() => router.back()} />
      <CameraView style={styles.camera} facing="front"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScan} />
      <Text style={[styles.prompt, { color: colors.muted }]}>{t('scanPrompt')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  camera: { flex: 1, borderRadius: 16, overflow: 'hidden', marginVertical: spacing.md },
  prompt: { fontFamily: fonts.sans, fontSize: 14, textAlign: 'center', marginBottom: spacing.lg },
  msg: { fontFamily: fonts.sansSemi, fontSize: 18 },
  link: { fontFamily: fonts.sansMed, fontSize: 15 },
});
```

Request permission on mount if not asked: add `useEffect(() => { if (permission && !permission.granted && permission.canAskAgain) requestPermission(); }, [permission]);` (import `useEffect`). On unknown code, scanning continues (no crash). The mock QR payload is simply a member id string (e.g. `m1`).

- [ ] **Step 2:** Ensure `app.json` has the camera plugin + permission text (added in Task 1; otherwise add now):
```json
["expo-camera", { "cameraPermission": "Allow MAAT Kiosk to scan member QR codes." }]
```
- [ ] **Step 3: Verify** — `npm run typecheck` (0 errors), `npm test` (green), `npx expo export --platform ios` (exit 0 — proves expo-camera bundles). Camera runtime is NOT testable headless; note it for device testing.
- [ ] **Step 4: Commit** — `git add "src/app/class/[id]/scan.tsx" app.json && git commit -m "feat(phase2): class-scoped QR check-in (expo-camera, mock memberId)"`

---

### Task 7: Integration tests

**Files:** Create `src/__tests__/checkin-flow.test.tsx`, `src/__tests__/test-utils.tsx`.

- [ ] **Step 1: Provider wrapper** `src/__tests__/test-utils.tsx`

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { CheckInProvider } from '../context/CheckInContext';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider><I18nProvider><CheckInProvider>{ui}</CheckInProvider></I18nProvider></ThemeProvider>,
  );
}
export * from '@testing-library/react-native';
```

- [ ] **Step 2: Flow tests** `src/__tests__/checkin-flow.test.tsx`

Because the screens use expo-router hooks, test at the component level by rendering the relevant screen with mocked router/params, OR test the search→check-in logic via the context + a rendered Search screen. Keep it robust: mock `expo-router` (`useRouter`, `useLocalSearchParams`, `Link`) and assert behavior.

```tsx
import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';

const replace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'c1', memberId: 'm1' }),
  Link: ({ children }: any) => children,
}));

import SearchScreen from '../app/class/[id]/search';
import CheckInScreen from '../app/class/[id]/checkin/[memberId]';

beforeEach(() => replace.mockClear());

test('search filters members and shows no-results', async () => {
  renderWithProviders(<SearchScreen />);
  // all members visible initially
  await waitFor(() => expect(screen.getByText(/Anna Rossi/)).toBeTruthy());
  fireEvent.changeText(screen.getByPlaceholderText(/Search your name|Busca tu nombre|Cerca il tuo nome/), 'zzzz');
  await waitFor(() => expect(screen.getByText(/No results|Sin resultados|Nessun risultato/)).toBeTruthy());
});

test('check-in navigates to success', async () => {
  renderWithProviders(<CheckInScreen />);
  fireEvent.press(screen.getByText(/Check In|Hacer check-in|Fai check-in/));
  await waitFor(() => expect(replace).toHaveBeenCalledWith(
    expect.objectContaining({ pathname: '/success' })));
});
```

Adjust matchers to the default language the test environment resolves (mock `expo-localization` to return `en` for determinism in `test-utils` or via `jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }))`). If a screen needs `expo-camera`, mock it too. The goal is 2–3 real assertions on the flow; if rendering a screen proves too coupled to native modules, fall back to asserting the context `checkIn` + a rendered Search list (still a real integration of context + UI).

- [ ] **Step 3: Verify** — `npm test` (now > 17; report the new total), `npm run typecheck`.
- [ ] **Step 4: Commit** — `git add src/__tests__ && git commit -m "test(phase2): integration tests for search + check-in flow"`

---

## Self-Review
- Theming: Tasks 1,3,4 — palettes, provider, all components/screens consume `useTheme`; shim removed. ✓
- i18n es/en/it: Tasks 1,2,3,4 — translations, provider, locale dates, all strings via `t()`, switcher. ✓
- QR: Task 6 (route) + Task 4 (button). ✓
- Animations: Task 5 (babel from Task 1). ✓
- Integration tests: Task 7. ✓
- Headless verification (typecheck/test/export) on every task; camera runtime deferred to device. ✓
- No placeholders; provider order fixed; persistence keys defined.
