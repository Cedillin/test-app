import { mergeAttendees, attendeeCount, isCheckedIn } from '../attendees';
import type { RosterEntry, CheckIn } from '../types';

const roster: RosterEntry[] = [
  { memberId: 'm1', status: 'registered', registeredAt: '2026-06-28T09:00:00.000Z' },
  { memberId: 'm2', status: 'registered', registeredAt: '2026-06-28T09:05:00.000Z' },
];
const checkins: CheckIn[] = [
  { id: 'k1', classId: 'c1', memberId: 'm1', status: 'confirmed', checkedInAt: '2026-06-28T10:01:00.000Z' }, // was registered
  { id: 'k2', classId: 'c1', memberId: 'm9', status: 'confirmed', checkedInAt: '2026-06-28T10:02:00.000Z' }, // walk-in
];

test('confirmed overrides the same registered member (no duplicate)', () => {
  const merged = mergeAttendees(roster, checkins);
  const m1 = merged.filter((a) => a.memberId === 'm1');
  expect(m1).toHaveLength(1);
  expect(m1[0].status).toBe('confirmed');
});

test('count is unique members after merge, not registered + confirmed', () => {
  // m1 (confirmed), m2 (registered), m9 (confirmed) => 3, not 4
  expect(attendeeCount(roster, checkins)).toBe(3);
});

test('isCheckedIn reflects confirmed check-ins only', () => {
  expect(isCheckedIn('m1', checkins)).toBe(true);
  expect(isCheckedIn('m2', checkins)).toBe(false);
});
