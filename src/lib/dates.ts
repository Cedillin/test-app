const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

const pad = (n: number) => String(n).padStart(2, '0');

export function todayIso(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ordinal(n: number): string {
  const s = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatHeaderDate(d: Date = new Date()): string {
  return `${DAYS[d.getDay()]}, ${ordinal(d.getDate())} ${MONTHS[d.getMonth()]}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}—${end}h`;
}

export function normalizeToToday<T extends { date: string }>(s: T, today: string = todayIso()): T {
  return { ...s, date: today };
}
