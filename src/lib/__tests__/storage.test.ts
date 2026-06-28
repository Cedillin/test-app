import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadCheckIns, saveCheckIns, purgeBefore, clearDay } from '../storage';
import type { CheckIn } from '../types';

beforeEach(async () => { await AsyncStorage.clear(); });

const ci = (id: string): CheckIn => ({ id, classId: 'c1', memberId: id, status: 'confirmed', checkedInAt: '2026-06-28T10:00:00.000Z' });

test('save then load round-trips for a day', async () => {
  await saveCheckIns('2026-06-28', [ci('m1')]);
  expect(await loadCheckIns('2026-06-28')).toEqual([ci('m1')]);
});

test('load returns [] for an unknown day', async () => {
  expect(await loadCheckIns('2099-01-01')).toEqual([]);
});

test('purgeBefore removes prior days, keeps today', async () => {
  await saveCheckIns('2026-06-27', [ci('old')]);
  await saveCheckIns('2026-06-28', [ci('m1')]);
  await purgeBefore('2026-06-28');
  expect(await loadCheckIns('2026-06-27')).toEqual([]);
  expect(await loadCheckIns('2026-06-28')).toEqual([ci('m1')]);
});

test('clearDay empties a single day', async () => {
  await saveCheckIns('2026-06-28', [ci('m1')]);
  await clearDay('2026-06-28');
  expect(await loadCheckIns('2026-06-28')).toEqual([]);
});
