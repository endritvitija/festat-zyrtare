"use client";

import * as React from "react";
import {
  format,
  parseISO,
  isWeekend,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import { sq, enUS, de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, CalendarClock } from "lucide-react";
import { Holiday, SingleCountry } from "@/types";
import { cn } from "@/lib/utils";
import { COUNTRY_FLAGS } from "@/lib/countries";

const dateFnsLocaleMap = { sq, en: enUS, de } as const;

const DAY_OFF_SUFFIX = /\s*\(Pushim\)$/;

interface HolidayListProps {
  holidays: Holiday[];
  countryFilter: SingleCountry;
}

function isDayOff(holiday: Holiday): boolean {
  return DAY_OFF_SUFFIX.test(holiday.name);
}

function displayName(holiday: Holiday): string {
  return holiday.name.replace(DAY_OFF_SUFFIX, "");
}

function useToday(): Date | null {
  const [today, setToday] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);
  return today;
}

function RelativeLabel({ days }: { days: number }) {
  const t = useTranslations("list");
  if (days === 0) {
    return (
      <span className="shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
        {t("today")}
      </span>
    );
  }
  return (
    <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
      {days === 1 ? t("tomorrow") : t("inDays", { count: days })}
    </span>
  );
}

function HolidayRow({
  holiday,
  daysUntil,
}: {
  holiday: Holiday;
  daysUntil: number | null;
}) {
  const t = useTranslations("list");
  const locale = useLocale() as "sq" | "en" | "de";
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? sq;
  const date = parseISO(holiday.date);
  const isWknd = isWeekend(date);
  const isPast = daysUntil !== null && daysUntil < 0;
  const dayOff = isDayOff(holiday);

  return (
    <li
      className={cn(
        "flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3",
        isPast && "opacity-50",
        daysUntil === 0 && "bg-orange-50/70 dark:bg-orange-950/20"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg",
          dayOff
            ? "bg-muted/50 text-muted-foreground"
            : "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
        )}
      >
        <span
          className={cn(
            "text-[10px] font-semibold uppercase leading-none tracking-wide",
            isWknd ? "text-red-500 dark:text-red-400" : "opacity-80"
          )}
        >
          {format(date, "EEE", { locale: dateFnsLocale }).replace(".", "")}
        </span>
        <span className="mt-1 text-lg font-bold leading-none tabular-nums">
          {format(date, "d")}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h4
          className={cn(
            "text-sm sm:text-base font-medium leading-snug text-foreground",
            dayOff && "text-foreground/80"
          )}
        >
          {displayName(holiday)}
        </h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="capitalize">
            {format(date, "EEEE", { locale: dateFnsLocale })}
          </span>
          {dayOff && (
            <span className="rounded-full border border-border px-2 py-px font-medium">
              {t("dayOff")}
            </span>
          )}
        </div>
      </div>

      {daysUntil !== null && daysUntil >= 0 && <RelativeLabel days={daysUntil} />}
    </li>
  );
}

function NextHolidayCard({
  holiday,
  daysUntil,
  countryFilter,
}: {
  holiday: Holiday;
  daysUntil: number;
  countryFilter: SingleCountry;
}) {
  const t = useTranslations("list");
  const locale = useLocale() as "sq" | "en" | "de";
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? sq;
  const date = parseISO(holiday.date);

  return (
    <div className="mx-4 sm:mx-0 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-5 dark:border-orange-900/50 dark:from-orange-950/40 dark:to-amber-950/20">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
        <CalendarClock className="h-4 w-4" />
        {t("nextHoliday")}
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg sm:text-xl font-bold leading-tight text-foreground">
            {displayName(holiday)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="mr-1.5">{COUNTRY_FLAGS[countryFilter]}</span>
            <span className="capitalize">
              {format(date, "EEEE, d MMMM", { locale: dateFnsLocale })}
            </span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          {daysUntil === 0 ? (
            <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
              {t("today")}
            </span>
          ) : daysUntil === 1 ? (
            <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
              {t("tomorrow")}
            </span>
          ) : (
            <>
              <span className="block text-3xl font-extrabold leading-none text-orange-600 dark:text-orange-400 tabular-nums">
                {daysUntil}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t("daysLeft", { count: daysUntil })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function HolidayList({ holidays, countryFilter }: HolidayListProps) {
  const t = useTranslations("list");
  const locale = useLocale() as "sq" | "en" | "de";
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? sq;
  const today = useToday();
  const [showPast, setShowPast] = React.useState(false);

  const filteredHolidays = React.useMemo(() => {
    return holidays
      .filter((h) => h.country === "BOTH" || h.country === countryFilter)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, countryFilter]);

  const daysUntil = React.useCallback(
    (holiday: Holiday) =>
      today ? differenceInCalendarDays(parseISO(holiday.date), today) : null,
    [today]
  );

  const pastCount = today
    ? filteredHolidays.filter((h) => (daysUntil(h) ?? 0) < 0).length
    : 0;

  const nextHoliday = today
    ? filteredHolidays.find((h) => (daysUntil(h) ?? -1) >= 0 && !isDayOff(h))
    : undefined;

  const visibleHolidays =
    today && !showPast
      ? filteredHolidays.filter((h) => (daysUntil(h) ?? 0) >= 0)
      : filteredHolidays;

  const groupedHolidays = React.useMemo(() => {
    const groups = new Map<number, Holiday[]>();
    visibleHolidays.forEach((holiday) => {
      const monthIndex = parseISO(holiday.date).getMonth();
      const list = groups.get(monthIndex) ?? [];
      list.push(holiday);
      groups.set(monthIndex, list);
    });
    return [...groups.entries()]
      .sort(([a], [b]) => a - b)
      .map(([monthIndex, monthHolidays]) => ({
        monthIndex,
        month: format(parseISO(monthHolidays[0].date), "LLLL", {
          locale: dateFnsLocale,
        }),
        monthHolidays,
      }));
  }, [visibleHolidays, dateFnsLocale]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {nextHoliday && (
        <NextHolidayCard
          holiday={nextHoliday}
          daysUntil={daysUntil(nextHoliday) ?? 0}
          countryFilter={countryFilter}
        />
      )}

      {pastCount > 0 && (
        <div className="px-4 sm:px-0">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            aria-expanded={showPast}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
          >
            {showPast ? t("hidePast") : t("showPast", { count: pastCount })}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showPast && "rotate-180")}
            />
          </button>
        </div>
      )}

      {today && !nextHoliday && !showPast && (
        <p className="px-4 sm:px-0 text-center text-sm text-muted-foreground">
          {t("noUpcoming")}
        </p>
      )}

      {groupedHolidays.map(({ month, monthHolidays, monthIndex }) => (
        <section key={monthIndex} data-month-index={monthIndex}>
          <div className="sticky top-[var(--filterbar-h)] z-30 flex items-baseline justify-between gap-2 bg-background px-4 py-3 sm:px-0">
            <h3 className="text-lg sm:text-xl font-bold capitalize text-foreground">
              {month}
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              {t("holidaysCount", {
                count: monthHolidays.filter((h) => !isDayOff(h)).length,
              })}
            </span>
          </div>
          <ul className="mx-4 sm:mx-0 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {monthHolidays.map((holiday) => (
              <HolidayRow
                key={holiday.date + holiday.name}
                holiday={holiday}
                daysUntil={daysUntil(holiday)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
