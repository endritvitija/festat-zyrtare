import { toGregorian } from "hijri-converter";
import { Holiday, Country } from "@/types";

export function getHolidayYear(date: Date = new Date()): number {
  return date.getFullYear();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  return toDateStr(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dayOfWeek(dateStr: string): number {
  return parseDateStr(dateStr).getDay(); // 0=Sun .. 6=Sat
}

function isWeekend(dateStr: string): boolean {
  const dow = dayOfWeek(dateStr);
  return dow === 0 || dow === 6;
}

function isSunday(dateStr: string): boolean {
  return dayOfWeek(dateStr) === 0;
}

/** Western (Catholic/Protestant) Easter Sunday — Anonymous Gregorian algorithm */
function catholicEasterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toDateStr(year, month, day);
}

/** Orthodox Easter Sunday (Julian computus → Gregorian) */
function orthodoxEasterSunday(year: number): string {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  // Julian Easter → Gregorian (+13 days for 1900–2099)
  return formatDate(addDays(parseDateStr(toDateStr(year, month, day)), 13));
}

/** Find Gregorian date of a Hijri month/day within a Gregorian year (Umm al-Qura). */
function hijriDateInYear(
  gregorianYear: number,
  hijriMonth: number,
  hijriDay: number
): string | null {
  const approxHijriYear = Math.round(((gregorianYear - 622) * 33) / 32);
  for (let hy = approxHijriYear - 2; hy <= approxHijriYear + 2; hy++) {
    const g = toGregorian(hy, hijriMonth, hijriDay);
    if (g.gy === gregorianYear) {
      return toDateStr(g.gy, g.gm, g.gd);
    }
  }
  return null;
}

function nextFreeWeekday(fromExclusive: string, occupied: Set<string>): string {
  let candidate = addDays(parseDateStr(fromExclusive), 1);
  while (true) {
    const str = formatDate(candidate);
    const dow = candidate.getDay();
    if (dow !== 0 && dow !== 6 && !occupied.has(str)) {
      return str;
    }
    candidate = addDays(candidate, 1);
  }
}

/**
 * Albania / Kosovo: if a holiday falls on Sat/Sun, observe on the next free weekday(s).
 * Consecutive weekend holidays stack onto Mon, Tue, …
 */
function addWeekendObservances(
  holidays: Holiday[],
  countries: Country[],
  sundayOnly = false
): Holiday[] {
  const relevant = holidays.filter((h) => countries.includes(h.country));
  const occupied = new Set(relevant.map((h) => h.date));
  const extras: Holiday[] = [];

  const sorted = [...relevant].sort((a, b) => a.date.localeCompare(b.date));

  for (const holiday of sorted) {
    const shouldObserve = sundayOnly
      ? isSunday(holiday.date)
      : isWeekend(holiday.date);
    if (!shouldObserve) continue;

    const observed = nextFreeWeekday(holiday.date, occupied);
    occupied.add(observed);
    const baseName = holiday.name.replace(/\s*\([^)]*\)\s*$/, "").trim();
    extras.push({
      date: observed,
      name: `${baseName} (Pushim)`,
      country: holiday.country,
      observedDate: holiday.date,
    });
  }

  return extras;
}

export function getHolidaysForYear(year: number): Holiday[] {
  const catholicEaster = catholicEasterSunday(year);
  const orthodoxEaster = orthodoxEasterSunday(year);
  const eidFitr = hijriDateInYear(year, 10, 1);
  const eidAdha = hijriDateInYear(year, 12, 10);

  const primary: Holiday[] = [
    // Shared
    { date: toDateStr(year, 1, 1), name: "Viti i Ri", country: "BOTH" },
    {
      date: toDateStr(year, 1, 2),
      name: "Viti i Ri (Dita e dytë)",
      country: "BOTH",
    },
    {
      date: toDateStr(year, 1, 7),
      name: "Krishtlindjet Ortodokse",
      country: "BOTH",
    },
    {
      date: catholicEaster,
      name: "Pashkët Katolike",
      country: "BOTH",
    },
    {
      date: orthodoxEaster,
      name: "Pashkët Ortodokse",
      country: "BOTH",
    },
    {
      date: toDateStr(year, 5, 1),
      name: "Dita e Punëtorëve",
      country: "BOTH",
    },
    {
      date: toDateStr(year, 12, 25),
      name: "Krishtlindjet Katolike",
      country: "BOTH",
    },

    // Albania
    { date: toDateStr(year, 3, 14), name: "Dita e Verës", country: "AL" },
    { date: toDateStr(year, 3, 22), name: "Dita e Nevruzit", country: "AL" },
    {
      date: toDateStr(year, 9, 5),
      name: "Dita e Shenjtërimit të Shenjt Terezës",
      country: "AL",
    },
    { date: toDateStr(year, 11, 22), name: "Dita e Alfabetit", country: "AL" },
    {
      date: toDateStr(year, 11, 28),
      name: "Dita e Flamurit dhe e Pavarësisë",
      country: "AL",
    },
    { date: toDateStr(year, 11, 29), name: "Dita e Çlirimit", country: "AL" },
    {
      date: toDateStr(year, 12, 8),
      name: "Dita Kombëtare e Rinisë",
      country: "AL",
    },

    // Kosovo
    {
      date: toDateStr(year, 2, 17),
      name: "Dita e Pavarësisë së Kosovës",
      country: "XK",
    },
    { date: toDateStr(year, 4, 9), name: "Dita e Kushtetutës", country: "XK" },
    { date: toDateStr(year, 5, 9), name: "Dita e Evropës", country: "XK" },

    // Montenegro (two-day national holidays always include the next calendar day)
    {
      date: toDateStr(year, 1, 6),
      name: "Krishtlindjet Ortodokse (Mbrëmje)",
      country: "ME",
    },
    {
      date: toDateStr(year, 1, 8),
      name: "Krishtlindjet Ortodokse (Dita e dytë)",
      country: "ME",
    },
    {
      date: formatDate(addDays(parseDateStr(orthodoxEaster), -2)),
      name: "E Premtja e Madhe Ortodokse",
      country: "ME",
    },
    {
      date: toDateStr(year, 5, 2),
      name: "Dita e Punëtorëve (Pushim)",
      country: "ME",
    },
    { date: toDateStr(year, 5, 21), name: "Dita e Pavarësisë", country: "ME" },
    {
      date: toDateStr(year, 5, 22),
      name: "Dita e Pavarësisë (Pushim)",
      country: "ME",
    },
    { date: toDateStr(year, 7, 13), name: "Dita Kombëtare", country: "ME" },
    {
      date: toDateStr(year, 7, 14),
      name: "Dita Kombëtare (Pushim)",
      country: "ME",
    },
    { date: toDateStr(year, 11, 13), name: "Dita e Njegoshit", country: "ME" },
    {
      date: toDateStr(year, 11, 14),
      name: "Dita e Njegoshit (Pushim)",
      country: "ME",
    },

    // North Macedonia
    {
      date: toDateStr(year, 5, 24),
      name: "Dita e Shenjtë Kiril dhe Metod",
      country: "MK",
    },
    {
      date: toDateStr(year, 8, 2),
      name: "Dita e Ilindënit (Dita e Republikës)",
      country: "MK",
    },
    { date: toDateStr(year, 9, 8), name: "Dita e Pavarësisë", country: "MK" },
    {
      date: toDateStr(year, 10, 11),
      name: "Dita e Revolucionit",
      country: "MK",
    },
    {
      date: toDateStr(year, 10, 23),
      name: "Dita e Luftës Revolucionare Maqedonase",
      country: "MK",
    },
    {
      date: toDateStr(year, 12, 8),
      name: "Dita e Shenjtë Klementit të Ohrit",
      country: "MK",
    },
  ];

  if (eidFitr) {
    primary.push({
      date: eidFitr,
      name: "Bajrami i Madh (Fitër Bajrami)",
      country: "BOTH",
    });
  }
  if (eidAdha) {
    primary.push({
      date: eidAdha,
      name: "Kurban Bajrami",
      country: "BOTH",
    });
  }

  // Weekend observances
  // Shared (BOTH) + Albania: Sat/Sun → next weekday(s)
  const alAndSharedObservances = addWeekendObservances(primary, ["BOTH", "AL"]);
  // Kosovo-only: Sat/Sun → next weekday(s)
  const xkObservances = addWeekendObservances(primary, ["XK"]);
  // North Macedonia: Sunday only → Monday
  const mkObservances = addWeekendObservances(primary, ["MK"], true);

  const all = [
    ...primary,
    ...alAndSharedObservances,
    ...xkObservances,
    ...mkObservances,
  ];

  return all.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.name.localeCompare(b.name);
  });
}

/** Holidays for the current calendar year — updates automatically each year. */
export const HOLIDAY_YEAR = getHolidayYear();
export const holidays = getHolidaysForYear(HOLIDAY_YEAR);
