"use client";

import * as React from "react";
import { Calendar, List, Download, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { SingleCountry } from "@/types";
import { cn } from "@/lib/utils";
import { downloadBulkIcsFile } from "@/lib/calendar";
import { holidays2026 } from "@/data/holidays";

import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface FilterBarProps {
  countryFilter: SingleCountry;
  view: "CALENDAR" | "LIST";
  onCountryChange: (country: SingleCountry) => void;
  onViewChange: (view: "CALENDAR" | "LIST") => void;
}

export function FilterBar({
  countryFilter,
  view,
  onCountryChange,
  onViewChange,
}: FilterBarProps) {
  const [isCountryMenuOpen, setIsCountryMenuOpen] = React.useState(false);
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);
  const tFilter = useTranslations("filterBar");
  const tCountries = useTranslations("countries");
  const tCountriesDownload = useTranslations("countriesDownload");

  const countries: SingleCountry[] = ["AL", "XK", "ME", "MK"];

  const countryNames: Record<SingleCountry, string> = {
    AL: tCountries("AL"),
    XK: tCountries("XK"),
    ME: tCountries("ME"),
    MK: tCountries("MK"),
  };

  const downloadButtonCountryNames: Record<SingleCountry, string> = {
    AL: tCountriesDownload("AL"),
    XK: tCountriesDownload("XK"),
    ME: tCountriesDownload("ME"),
    MK: tCountriesDownload("MK"),
  };

  const getHolidayCount = React.useMemo(() => {
    const realHolidays = holidays2026.filter(
      holiday => 
        !holiday.name.includes('(Pushim)') && 
        !holiday.name.includes('(Dita e dytë)')
    );

    const counts: Record<SingleCountry, number> = {
      AL: realHolidays.filter(h => h.country === 'AL' || h.country === 'BOTH').length,
      XK: realHolidays.filter(h => h.country === 'XK' || h.country === 'BOTH').length,
      ME: realHolidays.filter(h => h.country === 'ME' || h.country === 'BOTH').length,
      MK: realHolidays.filter(h => h.country === 'MK' || h.country === 'BOTH').length,
    };
    return counts;
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBulkImport = (country: SingleCountry) => {
    const countryHolidays = holidays2026.filter(
      (h) => h.country === country || h.country === "BOTH"
    );
    downloadBulkIcsFile(countryHolidays, downloadButtonCountryNames[country]);
  };

  return (
    <div className="sticky top-0 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 w-full mb-8 py-4 px-4 bg-background  border-b border-border/40 transition-all">
      <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto" ref={countryDropdownRef}>
          <button
            onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-secondary/50 hover:bg-secondary text-foreground transition-all border border-transparent hover:border-border w-full sm:w-auto min-w-[180px]"
          >
            <span>{countryNames[countryFilter]}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isCountryMenuOpen && "rotate-180"
              )}
            />
          </button>

          {isCountryMenuOpen && (
            <div className="absolute left-0 mt-2 w-full sm:w-56 rounded-md shadow-lg bg-popover border border-border z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => {
                    onCountryChange(country);
                    setIsCountryMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full text-left px-4 py-3 text-sm text-popover-foreground hover:bg-muted transition-colors",
                    countryFilter === country && "bg-muted/50 font-medium"
                  )}
                >
                  <span>{countryNames[country]}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({getHolidayCount[country]})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleBulkImport(countryFilter)}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all border w-full sm:w-auto bg-secondary/50 hover:bg-secondary text-foreground border-transparent hover:border-border cursor-pointer"
          title={tFilter("downloadTitle", {
            country: downloadButtonCountryNames[countryFilter],
          })}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>
            {tFilter("downloadFor", {
              country: downloadButtonCountryNames[countryFilter],
            })}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start sm:gap-2">
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => onViewChange("CALENDAR")}
            className={cn(
              "p-2 rounded-md transition-all cursor-pointer",
              view === "CALENDAR"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={tFilter("calendarView")}
          >
            <Calendar className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewChange("LIST")}
            className={cn(
              "p-2 rounded-md transition-all cursor-pointer",
              view === "LIST"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={tFilter("listView")}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
