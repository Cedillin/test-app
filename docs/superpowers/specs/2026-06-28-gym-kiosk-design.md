# MAAT Gym Kiosk — Design Spec

**Date**: 2026-06-28
**Status**: Draft — implementation-ready for the Core scope below
**Source brief**: `README.md` (take-home challenge)
**Time-box**: max 2 days

## Overview

A tablet kiosk app (portrait) for a gym where members check in for today's
classes. **Primary actor: the member, self-service** — they walk up to the
kiosk, tap their class, **find their name**, and confirm. The kiosk then shows a
success screen that auto-resets to ready. A QR "bump" flow (bonus) lets a member
scan to check in without searching.

Copy follows the self-service story ("Find your name", not "Add check-in"). The
class screen's attendee list is the public class overview required by the brief,
not a private roster.

Design fidelity is graded against a Figma reference (Aranha gym). Tokens below
are **tentative**, read from the provided screenshot — see *Figma verification*.

## Scope & phasing

The brief insists on 2 days and "quality over quantity". So only the mandatory
flow is locked. Bonus items ship **only after the core is polished** — if time
runs out, they are cut, not half-built.

### Core (locked — the deliverable)

| Area | Decision | Why |
|---|---|---|
| Stack | Expo (managed) + TypeScript + expo-router | Fast iteration, runs on iPad/Android, fits 2-day box |
| Orientation | Portrait, locked | Matches Figma; kiosk on tablet |
| Data (static) | `members.json`, `classes.json` in bundle | Recommended in brief; no backend |
| Data (mutable) | Check-ins persisted in AsyncStorage, **date-scoped** | Survive restart; auto-purge stale days (see Persistence) |
| State | Single `CheckInContext` (Context + useReducer) | App is small; one store. No Zustand (YAGNI) |
| Fonts | Geist Sans + Geist Mono via expo-font | Required by brief |
| Flow | Home → Class → Search → Check-In → Success → reset | The 5 required screens + states |

### Bonus (ship only after core is polished; cut first if short on time)

| Area | Decision | Notes |
|---|---|---|
| Animations | reanimated + moti | Screen transitions + success "pop" |
| Integration tests | @testing-library/react-native | Critical flow + no-results + duplicate |
| QR check-in | expo-camera, **class-scoped** route, mock payload (`memberId` only) | See *QR (bonus)*; resolves the classId ambiguity |

## Figma verification

- **Source so far**: a single screenshot of the **Home** frame (provided by the
  user; the Figma dev link could not be opened directly).
- **Confidence**: tokens below are read by eye from that screenshot →
  **tentative**. Hex values and spacing are approximations.
- **Rule before/while building UI**: if the Figma dev link becomes inspectable,
  pull exact values (colors, font sizes, radii, spacing) from dev mode and
  reconcile against this list. Screens not in the screenshot (Class, Search,
  Check-In, Success) are a **coherent extension** of the Home language, not a
  copy of an existing frame — flag them as such in the submission README.

## Design tokens (tentative — from Home screenshot)

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
  profilePicture?: string  // optional URL; Avatar falls back to colored initials
}

type RosterEntry = {
  memberId: string
  status: 'registered'
  registeredAt: string     // ISO
}

type ClassSession = {
  id: string
  name: string             // e.g. "BJJ /Grappling"
  date: string             // "YYYY-MM-DD" — see note below
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
registered roster entry (same person never appears twice). Count shown is
**`unique memberIds after merge / capacity`** — never `registered + confirmed`,
which would double-count anyone who was registered and then confirmed.

**`date` / "today"**: `classes.json` ships as **today's fixtures**; the Home
header date is computed from the device clock. `date` is included so the merge
logic and check-in storage can key on the real day (matters for persistence,
below) and so the model is honest about "today's classes". Multi-day filtering
is out of scope — we render the bundled sessions as today's.

## Persistence (AsyncStorage)

Check-ins are the only mutable, persisted state.

- **Key scheme**: `checkins:<YYYY-MM-DD>` → `CheckIn[]` for that day.
- **On startup**: load today's key; **purge any `checkins:*` key whose date is
  before today** so the kiosk never boots tomorrow showing yesterday's
  attendance.
- **Dev reset**: a hidden/dev-only "reset today" action to clear the current
  day's check-ins during demos and tests.

## Screens & routes (expo-router)

**Core routes:**

| Route | Screen | Key content |
|---|---|---|
| `/` | Home | Date (mono), "Welcome to Aranha", hero card, **2-col grid of today's classes**, promo banner, "Pro tip" footer (**informational** until QR bonus lands) |
| `/class/[id]` | Class | Name, time, instructor, tags, `X/capacity`, attendee list (avatar, name, status, time), **"Find your name"** button |
| `/class/[id]/search` | Member Search | Client-side name filter, scrollable member list, **"no results"** empty state |
| `/class/[id]/checkin/[memberId]` | Check-In | Member name, today's date, large **"Check In"** CTA |
| `/success` | Success | Confirmation, **auto-reset to `/` after ~2.5s** (timer cancelled on manual navigation) |

**Bonus route (Phase 2):**

| Route | Screen | Key content |
|---|---|---|
| `/class/[id]/scan` | QR (mock) | **Class-scoped** — `classId` comes from the route, so the QR payload only carries `memberId`. expo-camera reads it → resolve member → check-in → success. Unknown/invalid `memberId` → error. No camera permission → fall back to manual search. The Home "Pro tip" becomes the entry point once this exists. |

### Navigation flow

```
Home ─tap class─▶ Class ─"Find your name"─▶ Search ─pick member─▶ Check-In ─"Check In"─▶ Success ─(2.5s)─▶ Home
                  Class ─"Scan" (bonus)──────────────────────────▶ Check-In/Success
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
1. Critical flow: open class → "Find your name" → search → select → Check In →
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

- Self-service member as the primary actor (not receptionist) — drives copy and
  flow; the attendee list is treated as a public class overview.
- Context over Zustand (smaller dep surface for a small app).
- Bonus items (QR, animations, integration tests) ship only after the core is
  polished; first to be cut under the 2-day box.
- QR is class-scoped and uses a mock `memberId` payload (no real member app).
- Profile pictures are optional URLs with a colored-initials fallback (no hard
  dependency on network images in a kiosk).
- Visual fidelity is "coherent", not pixel-perfect (per brief); tokens are
  tentative until Figma dev mode is inspected.
- No native kiosk-lock (limited in Expo managed); noted as future work.

## Out of scope / future work

- Real member app + real QR/NFC "bump".
- Native guided-access / kiosk lock.
- Backend API + multi-device sync.
- Offline-first sync (data is already local, so mostly N/A).
