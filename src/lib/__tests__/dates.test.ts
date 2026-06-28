import { todayIso, formatHeaderDate, formatTimeRange, normalizeToToday } from '../dates';

test('todayIso returns local YYYY-MM-DD', () => {
  expect(todayIso(new Date(2026, 5, 1))).toBe('2026-06-01'); // month is 0-based
});

test('formatHeaderDate is uppercase with ordinal in English', () => {
  expect(formatHeaderDate(new Date(2026, 5, 1), 'en')).toBe('MONDAY, 1ST JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 2), 'en')).toBe('TUESDAY, 2ND JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 3), 'en')).toBe('WEDNESDAY, 3RD JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 4), 'en')).toBe('THURSDAY, 4TH JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 11), 'en')).toBe('THURSDAY, 11TH JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 12), 'en')).toBe('FRIDAY, 12TH JUNE');
  expect(formatHeaderDate(new Date(2026, 5, 13), 'en')).toBe('SATURDAY, 13TH JUNE');
});

test('formatHeaderDate supports Spanish locale', () => {
  expect(formatHeaderDate(new Date(2026, 5, 1), 'es')).toBe('LUNES, 1 DE JUNIO');
});

test('formatHeaderDate supports Italian locale', () => {
  expect(formatHeaderDate(new Date(2026, 5, 1), 'it')).toBe('LUNEDÌ, 1 GIUGNO');
});

test('formatHeaderDate defaults to English', () => {
  expect(formatHeaderDate(new Date(2026, 5, 1))).toBe('MONDAY, 1ST JUNE');
});

test('formatTimeRange renders like the Figma', () => {
  expect(formatTimeRange('10:00', '11:00')).toBe('10:00—11:00h');
});

test('normalizeToToday overrides the date field', () => {
  expect(normalizeToToday({ date: '2000-01-01' }, '2026-06-28').date).toBe('2026-06-28');
});
