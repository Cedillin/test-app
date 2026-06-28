# MAAT Gym Kiosk — Design Spec

**Date**: 2026-06-28
**Status**: Approved
**Source brief**: `README.md` (take-home challenge)
**Time-box**: max 2 days

## Overview

A tablet kiosk app (portrait) for a gym where members check in for today's
classes. A receptionist (or the member) searches a member, confirms, and the
kiosk shows a success screen that auto-resets to ready. A QR "bump" flow lets a
member scan to check in automatically (mocked).

Design fidelity is graded against a Figma reference (Aranha gym). Tokens are
extracted from the provided Figma screenshot.

## Decisions (locked)

| Area | Decision | Why |
|---|---|---|
| Stack | Expo (managed) + TypeScript + expo-router | Fast iteration, runs on iPad/Android, fits 2-day box |
| Orientation | Portrait, locked | Matches Figma; kiosk on tablet |
| Data (static) | `members.json`, `classes.json` in bundle | Recommended in brief; no backend |
| Data (mutable) | Check-ins persisted in AsyncStorage | Check-ins survive app restart (realistic kiosk) |
| State | Single `CheckInContext` (Context + useReducer) | App is small; one store. No Zustand (YAGNI) |
| Animations | reanimated + moti | Screen transitions + success "pop" |
| QR | expo-camera, functional but mock payload (`memberId`) | In Figma "Pro tip"; brief bonus |
| Fonts | Geist Sans + Geist Mono via expo-font | Required by brief |
| Tests | @testing-library/react-native, integration of critical flow | Code-quality + bonus weighting |

## Design tokens (from Figma)

- **Type**: Geist Sans (headings/body, heavy weight on big titles), Geist Mono
  (small uppercase labels with letter-spacing: date, `EXPERIENCES`, tags).
- **Colors**: background `#FFFFFF`, card `#F4F4F5`, text `#0A0A0A`, muted
  `#737373`, top bar `~#1A1A1A`, accent blue `~#2563EB`.
- **Tag pills**: soft pastel, full-rounded — KIDS pink, YOGA blue, MMA orange,
  BJJ green.
- **Cards / hero**: rounded corners (cards ~16px, hero/promo ~24px). Hero is a
  dark image with overlaid mono label + bold white title + subtitle.

> Note: the bright-blue outer border and dashed selection box in the Figma
> screenshot are Figma selection artifacts, not part of the design.

## Data model

```ts
type Member = {
  id: string
  firstName: string
  lastName: string
  profilePicture: string   // URL
}

type RosterEntry = {
  memberId: string
  status: 'registered'
  registeredAt: string     // ISO
}

type ClassSession = {
  id: string
  name: string             // e.g. "BJJ /Grappling"
  startTime: string        // "10:00"
  endTime: string          // "11:00"
  instructor: string       // "Lautaro S."
  tags: string[]           // ["KIDS","YOGA","MMA","BJJ"]
  capacity: number         // 30
  roster: RosterEntry[]    // pre-registered members
}

type CheckIn = {
  id: string
  classId: string
  memberId: string
  status: 'confirmed'
  checkedInAt: string      // ISO
}
```

**Attendee list of a class** = `roster` (status `registered`) merged with
check-ins (status `confirmed`) by `memberId`. A confirmed check-in overrides a
registered roster entry. Count shown as `confirmed+registered / capacity`.

## Screens & routes (expo-router)

| Route | Screen | Key content |
|---|---|---|
| `/` | Home | Date (mono), "Welcome to Aranha", hero card, **2-col grid of today's classes**, promo banner, "Pro tip" QR footer (taps → `/scan`) |
| `/class/[id]` | Class | Name, time, instructor, tags, `X/capacity`, attendee list (avatar, name, status, time), "Add check-in" button |
| `/class/[id]/search` | Member Search | Client-side name filter, scrollable member list, **"no results"** empty state |
| `/class/[id]/checkin/[memberId]` | Check-In | Member name, today's date, large **"Check In"** CTA |
| `/success` | Success | Animated confirmation, **auto-reset to `/` after ~2.5s** |
| `/scan` | QR (mock) | expo-camera reads QR encoding `memberId` → resolve member → check-in → success. No camera permission → fall back to manual search |

### Navigation flow

```
Home ──tap class──▶ Class ──"Add check-in"──▶ Search ──pick member──▶ Check-In ──"Check In"──▶ Success ──(2.5s)──▶ Home
Home ──"Pro tip"──▶ Scan ──valid QR──▶ Check-In/Success
```

## Components

`lib/theme.ts` (color/spacing/type tokens) · `ClassCard` · `TagPill` ·
`Avatar` · `AttendeeRow` · `SearchBar` · `PrimaryButton` · `HeroCard` ·
`ScreenHeader` · `EmptyState`.

## States to handle

- **Loading**: fonts + JSON loading (splash/skeleton).
- **Empty**: no classes today, no members, no search results.
- **Error**: check-in failure, member already checked in for that class (block
  duplicate, show message), invalid/unknown QR.
- **Success**: confirmation + auto-reset.

## Edge cases

- Duplicate check-in: if member already `confirmed` for the class, show
  "already checked in" instead of a second record.
- Capacity full: allow check-in but surface the count (don't hard-block — brief
  doesn't require it; flag as decision).
- QR with unknown `memberId`: show error, return to scan/home.
- Auto-reset must cancel its timer if the user navigates away manually.

## Testing

Integration tests (@testing-library/react-native):
1. Critical flow: open class → add check-in → search → select → Check In →
   success → reset to Home.
2. Search "no results" state.
3. Duplicate check-in is blocked.

## Project structure

```
app/                 # expo-router routes (screens above)
components/           # reusable UI
context/             # CheckInContext (+ reducer)
data/                # members.json, classes.json
lib/                 # theme.ts, storage.ts, dates.ts, attendees.ts
assets/fonts/        # Geist Sans + Mono
__tests__/           # integration tests
```

## Trade-offs

- Context over Zustand (smaller dep surface for a small app).
- QR is functional but uses a mock payload (no real member companion app).
- Visual fidelity is "coherent", not pixel-perfect (per brief).
- No native kiosk-lock (limited in Expo managed); noted as future work.

## Out of scope / future work

- Real member app + real QR/NFC "bump".
- Native guided-access / kiosk lock.
- Backend API + multi-device sync.
- Offline-first sync (data is already local, so mostly N/A).
