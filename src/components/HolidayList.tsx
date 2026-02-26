"use client";

import * as React from "react";
import { format, parseISO, isWeekend } from "date-fns";
import { sq, enUS, de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Holiday, Country } from "@/types";
import { cn } from "@/lib/utils";

const dateFnsLocaleMap = { sq, en: enUS, de } as const;

interface HolidayListProps {
  holidays: Holiday[];
  countryFilter: Country;
}

function HolidayListItem({ holiday, countryFilter }: { holiday: Holiday; countryFilter: Country }) {
  const date = parseISO(holiday.date);
  const isWknd = isWeekend(date);
  const locale = useLocale() as "sq" | "en" | "de";
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? sq;
  const tCountries = useTranslations("countries");

  const countryNames: Record<Country, string> = {
    AL: tCountries("AL"),
    XK: tCountries("XK"),
    ME: tCountries("ME"),
    MK: tCountries("MK"),
    BOTH: tCountries("BOTH"),
  };

  const countryFlags: Record<Country, string> = {
    AL: '🇦🇱',
    XK: '🇽🇰',
    ME: '🇲🇪',
    MK: '🇲🇰',
    BOTH: '🌍',
  };

  const getDisplayFlags = () => {
    if (holiday.country === 'BOTH') {
      if (countryFilter === 'BOTH') {
        return (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            🇦🇱 🇽🇰 🇲🇪 🇲🇰 {countryNames['BOTH']}
          </span>
        );
      } else {
        return (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {countryFlags[countryFilter]} {countryNames[countryFilter]}
          </span>
        );
      }
    }
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {countryFlags[holiday.country]} {countryNames[holiday.country]}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 px-4 transition-colors border-b border-border",
        isWknd && "opacity-90"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted/30",
            isWknd && "text-red-500/80"
          )}
        >
          <span
            className={cn(
              "text-[10px] font-bold uppercase text-muted-foreground",
              isWknd && "text-red-500/80"
            )}
          >
            {format(date, "EEEE", { locale: dateFnsLocale })}
          </span>
          <span className="text-lg font-bold leading-none">
            {format(date, "d")}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-foreground">{holiday.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            {getDisplayFlags()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HolidayList({ holidays, countryFilter }: HolidayListProps) {
  const locale = useLocale() as "sq" | "en" | "de";
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? sq;

  const filteredHolidays = React.useMemo(() => {
    return holidays.filter(
      (h) =>
        countryFilter === "BOTH" ||
        h.country === "BOTH" ||
        h.country === countryFilter
    );
  }, [holidays, countryFilter]);

  const groupedHolidays = React.useMemo(() => {
    const groups: Record<string, Holiday[]> = {};
    filteredHolidays.forEach((holiday) => {
      const month = format(parseISO(holiday.date), "MMMM", { locale: dateFnsLocale });
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(holiday);
    });
    // Sort each month's holidays by date, then return entries sorted by month index (Jan=0 .. Dec=11)
    const entries = Object.entries(groups).map(([month, monthHolidays]) => {
      const sorted = [...monthHolidays].sort(
        (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
      );
      const monthIndex = parseISO(sorted[0].date).getMonth();
      return { month, monthHolidays: sorted, monthIndex };
    });
    entries.sort((a, b) => a.monthIndex - b.monthIndex);
    return entries;
  }, [filteredHolidays, dateFnsLocale]);

  const listContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const currentMonthIndex = new Date().getMonth();
    const el = listContainerRef.current?.querySelector(
      `[data-month-index="${currentMonthIndex}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div ref={listContainerRef} className="space-y-12 max-w-1xl mx-auto">
      {groupedHolidays.map(({ month, monthHolidays, monthIndex }) => (
        <div key={month} data-month-index={monthIndex}>
          <h3 className="text-xl font-bold capitalize text-foreground px-4 py-4 sticky top-[180px] sm:top-[72px] z-30 bg-background/95 backdrop-blur-sm border-b-2 border-border/50">
            {month}
          </h3>
          <div className="space-y-2">
            {monthHolidays.map((holiday) => (
              <HolidayListItem
                key={holiday.date + holiday.name}
                holiday={holiday}
                countryFilter={countryFilter}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
