const DAYS = {
  en: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'],
  es: ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'],
  it: ['DOMENICA','LUNEDÌ','MARTEDÌ','MERCOLEDÌ','GIOVEDÌ','VENERDÌ','SABATO'],
};
const MONTHS = {
  en: ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'],
  es: ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'],
  it: ['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO','LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'],
};

const pad = (n: number) => String(n).padStart(2, '0');

export function todayIso(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ordinal(n: number): string {
  const s = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatHeaderDate(d: Date = new Date(), lang: 'es'|'en'|'it' = 'en'): string {
  const day = DAYS[lang][d.getDay()];
  const month = MONTHS[lang][d.getMonth()];
  if (lang === 'en') return `${day}, ${ordinal(d.getDate())} ${month}`;
  if (lang === 'es') return `${day}, ${d.getDate()} DE ${month}`;
  return `${day}, ${d.getDate()} ${month}`; // it
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}—${end}h`;
}

export function normalizeToToday<T extends { date: string }>(s: T, today: string = todayIso()): T {
  return { ...s, date: today };
}
