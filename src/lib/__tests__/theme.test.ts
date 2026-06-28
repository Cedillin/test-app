// lib/__tests__/theme.test.ts
import { colors, tagStyle } from '../theme';

test('core color tokens are present', () => {
  expect(colors.background).toBe('#FFFFFF');
  expect(colors.accent).toBe('#2563EB');
});

test('tagStyle maps known tags case-insensitively and falls back', () => {
  expect(tagStyle('KIDS').fg).toBe('#DB2777');
  expect(tagStyle('yoga').bg).toBe('#DBEAFE');
  expect(tagStyle('UNKNOWN')).toEqual(colors.tagDefault);
});
