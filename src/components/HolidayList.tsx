"use client";

import * as React from "react";
import {
  format,
  parseISO,
  differenceInCalendarDays,
  startOfDay,
  isSameDay,
} from "date-fns";
import { sq, enUS, de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Holiday, SingleCountry } from "@/types";
import { cn } from "@/lib/utils";

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

function DayGroup({
  date,
  holidays,
  isToday,
  isPast,
  isLast,
}: {
  date: Date;
  holidays: Holiday[];
  isToday: boolean;
  isPast: boolean;
  isLast: boolean;
}) {
  const t = useTranslations("list");
  const locale = useLocale() as "sq" | "en" | "de";
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? sq;

  return (
    <section
      className={cn(
        "px-4 py-3 sm:px-0",
        !isLast && "border-b border-border/40",
        isPast && "opacity-45"
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        {isToday && (
          <span className="rounded-md bg-foreground px-2 py-0.5 text-sm font-medium text-background">
            {t("today")}
          </span>
        )}
        <h3 className="text-sm font-medium capitalize text-foreground">
          {format(date, "EEEE, MMM d", { locale: dateFnsLocale })}
        </h3>
      </div>
      <ul>
        {holidays.map((holiday) => {
          const dayOff = isDayOff(holiday);
          return (
            <li key={holiday.date + holiday.name} className="flex items-center gap-3 py-2">
              <span
                className={cn(
                  "h-8 w-1 shrink-0 rounded-full",
                  dayOff ? "bg-muted-foreground/35" : "bg-orange-500"
                )}
              />
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-snug text-foreground">
                  {displayName(holiday)}
                </p>
                {dayOff && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{t("dayOff")}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
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
      .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
  }, [holidays, countryFilter]);

  const pastCount = today
    ? filteredHolidays.filter(
        (h) => differenceInCalendarDays(parseISO(h.date), today) < 0
      ).length
    : 0;

  const visibleHolidays =
    today && !showPast
      ? filteredHolidays.filter(
          (h) => differenceInCalendarDays(parseISO(h.date), today) >= 0
        )
      : filteredHolidays;

  const months = React.useMemo(() => {
    const byMonth = new Map<string, { date: string; holidays: Holiday[] }[]>();
    for (const holiday of visibleHolidays) {
      const monthKey = holiday.date.slice(0, 7);
      const days = byMonth.get(monthKey) ?? [];
      const last = days[days.length - 1];
      if (last && last.date === holiday.date) {
        last.holidays.push(holiday);
      } else {
        days.push({ date: holiday.date, holidays: [holiday] });
      }
      byMonth.set(monthKey, days);
    }
    return [...byMonth.entries()].map(([monthKey, days]) => ({
      monthKey,
      label: format(parseISO(`${monthKey}-01`), "MMMM", { locale: dateFnsLocale }),
      days,
    }));
  }, [visibleHolidays, dateFnsLocale]);

  return (
    <div>
      {pastCount > 0 && (
        <button
          type="button"
          onClick={() => setShowPast((v) => !v)}
          aria-expanded={showPast}
          className="flex w-full items-center gap-1.5 border-b border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer sm:px-0"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", !showPast && "-rotate-90")}
          />
          {showPast ? t("hidePast") : t("showPast", { count: pastCount })}
        </button>
      )}

      {months.length === 0 && (
        <p className="px-4 py-8 text-sm text-muted-foreground sm:px-0">
          {t("noUpcoming")}
        </p>
      )}

      {months.map(({ monthKey, label, days }) => (
        <section key={monthKey} className="scroll-mt-[var(--filterbar-h)]">
          <div className="sticky top-[var(--filterbar-h)] z-30 border-b border-border bg-background">
            <h3 className="px-4 py-3 text-lg font-bold capitalize text-foreground sm:px-0 sm:text-xl">
              {label}
            </h3>
          </div>
          {days.map(({ date, holidays: dayHolidays }, index) => {
            const parsed = parseISO(date);
            return (
              <DayGroup
                key={date}
                date={parsed}
                holidays={dayHolidays}
                isToday={today ? isSameDay(parsed, today) : false}
                isPast={today ? differenceInCalendarDays(parsed, today) < 0 : false}
                isLast={index === days.length - 1}
              />
            );
          })}
        </section>
      ))}
    </div>
  );
}
