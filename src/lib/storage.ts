import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CheckIn } from './types';

const PREFIX = 'checkins:';
const keyFor = (date: string) => `${PREFIX}${date}`;

export async function loadCheckIns(date: string): Promise<CheckIn[]> {
  const raw = await AsyncStorage.getItem(keyFor(date));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CheckIn[];
  } catch {
    return [];
  }
}

export async function saveCheckIns(date: string, items: CheckIn[]): Promise<void> {
  await AsyncStorage.setItem(keyFor(date), JSON.stringify(items));
}

export async function purgeBefore(date: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const stale = keys.filter((k) => k.startsWith(PREFIX) && k.slice(PREFIX.length) < date);
  if (stale.length) await AsyncStorage.multiRemove(stale);
}

export async function clearDay(date: string): Promise<void> {
  await AsyncStorage.removeItem(keyFor(date));
}
