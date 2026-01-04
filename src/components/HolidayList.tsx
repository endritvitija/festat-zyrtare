"use client";

import * as React from "react";
import { format, parseISO, isWeekend } from "date-fns";
import { sq } from "date-fns/locale";
import { Holiday, Country } from "@/types";
import { cn } from "@/lib/utils";

interface HolidayListProps {
  holidays: Holiday[];
  countryFilter: Country;
}

function HolidayListItem({ holiday }: { holiday: Holiday }) {
  const date = parseISO(holiday.date);
  const isWknd = isWeekend(date);

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
            {format(date, "EEEE", { locale: sq })}
          </span>
          <span className="text-lg font-bold leading-none">
            {format(date, "d")}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-foreground">{holiday.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            {holiday.country === "AL" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                🇦🇱 Shqipëri
              </span>
            )}
            {holiday.country === "XK" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                🇽🇰 Kosovë
              </span>
            )}
            {holiday.country === "BOTH" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                🇦🇱 🇽🇰 Të dyja
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HolidayList({ holidays, countryFilter }: HolidayListProps) {
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
      const month = format(parseISO(holiday.date), "MMMM", { locale: sq });
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(holiday);
    });
    return groups;
  }, [filteredHolidays]);

  return (
    <div className="space-y-12 max-w-1xl mx-auto">
      {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
        <div key={month}>
          <h3 className="text-xl font-bold capitalize text-foreground px-4 py-4 sticky top-[180px] sm:top-[72px] z-30 bg-background/95 backdrop-blur-sm border-b-2 border-border/50">
            {month}
          </h3>
          <div className="space-y-2">
            {monthHolidays.map((holiday) => (
              <HolidayListItem
                key={holiday.date + holiday.name}
                holiday={holiday}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
