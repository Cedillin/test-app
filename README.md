# MAAT Gym Kiosk

A tablet **kiosk app** where gym members self-check-in to today's classes. A member walks up, picks a class, finds their name (or scans a QR), confirms — and the kiosk shows a success screen that auto-resets to "ready".

Built with **Expo (React Native) + TypeScript**. Take-home challenge, time-boxed to ~2 days.

## 🔗 Live demo

- **App (web build):** https://cedillin.github.io/test-app/
- **Interactive design & decisions guide:** https://cedillin.github.io/test-app/guide.html
  *(brainstorming → execution plan → Jira-style board → 5 PM/CEO/dev/QA personas → an interactive app mockup → the Figma reference)*

> The web build is for quick previewing; the camera/QR step is a no-op on web. For the full native experience (and QR), run it in Expo Go — see [Run it](#-run-it-step-by-step).

The design follows the provided [Figma concept](https://www.figma.com/design/yZiTpnsOb9E8v0lUHRHNB9/MAAT-Kiosk-Concept?node-id=0-1&m=dev) and the [Geist](https://github.com/vercel/geist-font/) font.

## ✨ Features

- **Full 5-screen kiosk flow:** Home → Class → Member Search → Check-In → Success (auto-resets to Home after ~2.5 s).
- **Light / Dark / System theme** — picked in a Settings modal (gear button on Home), persisted.
- **Internationalization (English / Spanish / Italian)** — defaults to the device language, persisted, switchable in Settings. Locale-aware dates.
- **QR check-in** (class-scoped, mock `memberId` payload) via `expo-camera`, with a manual-search fallback when permission is denied.
- **Animations:** spring "pop" on the success screen + native screen transitions (`moti` / `reanimated`).
- **Date-scoped persistence:** check-ins saved per day in AsyncStorage (`checkins:<YYYY-MM-DD>`), with automatic purge of previous days so the kiosk boots clean.
- **All states handled:** loading, empty, error (duplicate / unknown member / no camera), and success.
- **Tested:** 22 unit + integration tests, TypeScript strict, headless web bundle verified.

## 🧭 The flow

```
Home ──tap a class──▶ Class ──"Find your name"──▶ Search ──pick member──▶ Check-In ──"Check In"──▶ Success ──(2.5s)──▶ Home
                       Class ──"Scan" (QR, mock)──────────────────────────────────────────────────▶ Success
```

## 🛠 Tech stack

| Area | Choice |
|---|---|
| Framework | Expo SDK 56, React Native, TypeScript (strict) |
| Navigation | `expo-router` (file-based routes under `src/app`) |
| State | React Context + `useReducer` (no extra state library) |
| Persistence | `@react-native-async-storage/async-storage` (date-scoped keys) |
| Fonts | Geist Sans + Geist Mono (`@expo-google-fonts`) |
| UI | `@expo/vector-icons`, `moti` + `react-native-reanimated` |
| Native | `expo-camera` (QR), `expo-localization` (default language) |
| Testing | `jest-expo` + `@testing-library/react-native` |

## ✅ Prerequisites

- **Node 18+** and npm
- One of:
  - **Expo Go** on your phone (iOS App Store / Google Play) — easiest, and required for the camera/QR step
  - **iOS Simulator** (Xcode, macOS only) or **Android Emulator** (Android Studio)

## 🚀 Run it (step by step)

```bash
# 1. Clone and install
git clone https://github.com/Cedillin/test-app.git
cd test-app
npm install

# 2. Start the dev server (Metro)
npx expo start
```

Then open the app:

- **Phone (recommended):** scan the QR code in the terminal with **Expo Go**
- **iOS Simulator:** press `i`
- **Android Emulator:** press `a`
- **Web preview:** press `w` (or `npm run web`)

**Try the flow:** tap the **gear** (top-right) to switch theme & language → open a class → **Find your name** → type to filter (try `zzz` for the empty state) → pick a member → **Check In** → the Success screen pops and auto-returns Home. Do a check-in, reload the app, reopen the class — the member stays **Confirmed** (persistence). For QR, open a class → **Scan** (real device only; encode a member id such as `m1`).

## 🔍 Quality checks

```bash
npm test          # 22 unit + integration tests
npm run typecheck # tsc --noEmit (strict)
npm run lint      # expo lint
npx expo export --platform ios   # headless production bundle (proof it builds)
```

## 🏗 Architecture

The app keeps a clean separation between **pure logic**, **state**, and **screens**:

- **Data** (`src/data`): bundled `members.json` / `classes.json`. Classes carry no fixed calendar date — they're **normalized to "today"** (device clock) on load, so the kiosk always shows today's sessions.
- **Pure logic** (`src/lib`): `dates` (locale-aware formatting, `todayIso`, time ranges), `attendees` (merge roster + check-ins into a **unique** attendee count), `storage` (date-scoped AsyncStorage with stale-day purge), `theme` (light/dark palettes + spacing/radius/font tokens), `types`. This layer is fully unit-tested.
- **State** (`src/context`): a single `CheckInContext` (Context + `useReducer`) holds members, today's classes, and the day's check-ins. `ADD_CHECKIN` is idempotent; persistence runs in an effect on committed state (no stale-closure writes). Two small cross-cutting providers — `ThemeContext` (theme mode) and `I18nContext` (language + `t()`), both memoized.
- **Screens** (`src/app`): thin `expo-router` screens that consume hooks (`useClasses`, `useMember`, `useCheckIns`, `useCheckInActions`, `useTheme`, `useI18n`). Colors are applied inline from the active palette; layout stays in static `StyleSheet`s.
- **Components** (`src/components`): reusable, theme-aware primitives (`Avatar`, `TagPill`, `PrimaryButton`, `ClassCard`, `HeroCard`, `AttendeeRow`, `SearchBar`, `ScreenHeader`, `EmptyState`).

### Project structure

```
src/
  app/            # expo-router routes (the 5 screens + /settings + /class/[id]/scan)
  components/     # reusable UI
  context/        # CheckInContext (+ reducer), ThemeContext, I18nContext
  data/           # members.json, classes.json
  lib/            # dates, attendees, storage, theme, types (pure, tested)
  i18n/           # translations (en/es/it)
  __tests__/      # integration tests + test-utils
docs/             # interactive delivery guide (also deployed to Pages)
```

## 🧠 Design decisions

- **Self-service actor.** The copy and flow are built around the member ("Find your name"), matching the Figma's "bump this device" concept. The attendee list is treated as a public class overview, not a private roster.
- **Unique attendee count.** Count = unique members after merging the pre-registered roster with confirmed check-ins — a confirmed check-in overrides a registered entry, so nobody is double-counted.
- **Photos with a graceful fallback.** Avatars use images and fall back to colored initials on error, so the kiosk never hard-depends on the network.
- **Settings behind a gear, not on Home.** Theme + language live in a Settings modal so Home stays close to the Figma (which has no switchers), while still being one tap away.
- **Responsive grid.** Two columns on tablet (the kiosk target, matching the Figma) and one column on the few places it matters; cards are equal-height with footers pinned to the bottom so the grid reads as even.
- **Inverted primary button.** The CTA fills with the foreground color and uses the background color for its label, so it stays high-contrast in both light and dark themes.
- **Date-scoped persistence.** Keying check-ins by day (and purging older days at startup) means a kiosk left running overnight never shows yesterday's attendance.

## ⚖️ Trade-offs

- **Context + `useReducer` over a state library.** The app is small; a single store keeps it dependency-light and easy to follow. A larger app would justify Zustand/Redux.
- **Bundled JSON over a backend.** Zero infra, instant demo. A real deployment would swap the data layer behind the same hooks for an API.
- **QR uses a mock payload.** There's no companion member app, so the QR carries only a `memberId`; the scan screen is class-scoped (the class comes from the route), which removes any ambiguity.
- **Camera is device-only.** It can't be exercised in the iOS Simulator or on web, so those paths fall back to manual search.

## 🔭 What I'd improve with more time

- Apply the refreshed card/visual language consistently to the Class / Search / Check-In screens.
- Native kiosk lock (guided access) — limited under Expo managed.
- A real backend + multi-device sync, and a real QR/NFC "bump" with a member app.
- More integration coverage (QR permission flows, theme/language persistence across restarts).
- Memoize the pre-existing `CheckInContext` value to trim re-renders.

## 📋 The interactive guide

[`docs/maat-kiosk-workspace.html`](docs/maat-kiosk-workspace.html) (also [live](https://cedillin.github.io/test-app/guide.html)) is a single self-contained page documenting how this was built: the brainstorming → decisions, the execution plan, a Jira-style task board, five stakeholder "personas" reviewing the work, an **interactive HTML mockup** of the app (click-through, theme + language toggles), and the Figma reference.

## 📝 Tests

- **Unit** (`src/lib`, `src/context`): date/time formatting, attendee merge & unique count, date-scoped storage + purge, reducer idempotency.
- **Integration** (`src/__tests__`): search filter + "no results" state, and the check-in → success navigation flow (with `expo-router` and `expo-localization` mocked for determinism).
