// context/__tests__/reducer.test.ts
import { reducer, initialState, type State } from '../reducer';
import type { ClassSession, Member, CheckIn } from '../../lib/types';

const members: Member[] = [{ id: 'm1', firstName: 'Anna', lastName: 'Rossi' }];
const classes: ClassSession[] = [{
  id: 'c1', name: 'BJJ /Grappling', date: '2026-06-28', startTime: '10:00', endTime: '11:00',
  instructor: 'Lautaro S.', tags: ['BJJ'], capacity: 30,
  roster: [{ memberId: 'm1', status: 'registered', registeredAt: '2026-06-28T09:00:00.000Z' }],
}];

const hydrated: State = reducer(initialState, { type: 'HYDRATE', date: '2026-06-28', members, classes, checkins: [] });

test('HYDRATE loads data and flips hydrated flag', () => {
  expect(hydrated.hydrated).toBe(true);
  expect(hydrated.classes).toHaveLength(1);
  expect(hydrated.membersById.m1.firstName).toBe('Anna');
});

test('ADD_CHECKIN appends a confirmed check-in', () => {
  const ci: CheckIn = { id: 'k1', classId: 'c1', memberId: 'm1', status: 'confirmed', checkedInAt: '2026-06-28T10:01:00.000Z' };
  const next = reducer(hydrated, { type: 'ADD_CHECKIN', checkin: ci });
  expect(next.checkins).toHaveLength(1);
  expect(next.checkins[0].memberId).toBe('m1');
});

test('ADD_CHECKIN is idempotent for the same class and member', () => {
  const ci: CheckIn = { id: 'k1', classId: 'c1', memberId: 'm1', status: 'confirmed', checkedInAt: '2026-06-28T10:01:00.000Z' };
  const once = reducer(hydrated, { type: 'ADD_CHECKIN', checkin: ci });
  const dup: CheckIn = { id: 'k2', classId: 'c1', memberId: 'm1', status: 'confirmed', checkedInAt: '2026-06-28T10:02:00.000Z' };
  const twice = reducer(once, { type: 'ADD_CHECKIN', checkin: dup });
  expect(twice.checkins).toHaveLength(1);
});

test('RESET_DAY clears check-ins only', () => {
  const ci: CheckIn = { id: 'k1', classId: 'c1', memberId: 'm1', status: 'confirmed', checkedInAt: '2026-06-28T10:01:00.000Z' };
  const withOne = reducer(hydrated, { type: 'ADD_CHECKIN', checkin: ci });
  const reset = reducer(withOne, { type: 'RESET_DAY' });
  expect(reset.checkins).toHaveLength(0);
  expect(reset.classes).toHaveLength(1);
});
