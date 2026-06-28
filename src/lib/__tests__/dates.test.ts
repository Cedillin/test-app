import { todayIso, formatHeaderDate, formatTimeRange, normalizeToToday } from '../dates';

test('todayIso returns local YYYY-MM-DD', () => {
  expect(todayIso(new Date(2026, 5, 1))).toBe('2026-06-01'); // month is 0-based
});

test('formatHeaderDate is uppercase with ordinal', () => {
  expect(formatHeaderDate(new Date(2026, 5, 1))).toBe('MONDAY, 1ST JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 2))).toBe('TUESDAY, 2ND JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 3))).toBe('WEDNESDAY, 3RD JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 4))).toBe('THURSDAY, 4TH JUNE');
});

test('formatTimeRange renders like the Figma', () => {
  expect(formatTimeRange('10:00', '11:00')).toBe('10:00—11:00h');
});

test('normalizeToToday overrides the date field', () => {
  expect(normalizeToToday({ date: '2000-01-01' }, '2026-06-28').date).toBe('2026-06-28');
});
