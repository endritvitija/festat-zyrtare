"use client";

import * as React from "react";
import { Calendar, List, Download, ChevronDown, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Holiday, SingleCountry } from "@/types";
import { cn } from "@/lib/utils";
import { downloadBulkIcsFile } from "@/lib/calendar";
import { COUNTRY_FLAGS } from "@/lib/countries";

interface FilterBarProps {
  countryFilter: SingleCountry;
  view: "CALENDAR" | "LIST";
  holidays: Holiday[];
  onCountryChange: (country: SingleCountry) => void;
  onViewChange: (view: "CALENDAR" | "LIST") => void;
}

const COUNTRIES: SingleCountry[] = ["AL", "XK", "ME", "MK"];

export function FilterBar({
  countryFilter,
  view,
  holidays,
  onCountryChange,
  onViewChange,
}: FilterBarProps) {
  const [isCountryMenuOpen, setIsCountryMenuOpen] = React.useState(false);
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);
  const tFilter = useTranslations("filterBar");
  const tCountries = useTranslations("countries");
  const tCountriesDownload = useTranslations("countriesDownload");

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
    const realHolidays = holidays.filter(
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
  }, [holidays]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCountryMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Sticky month headers below this bar read its height from --filterbar-h
  React.useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--filterbar-h",
        `${el.offsetHeight}px`
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleBulkImport = (country: SingleCountry) => {
    const countryHolidays = holidays.filter(
      (h) => h.country === country || h.country === "BOTH"
    );
    downloadBulkIcsFile(countryHolidays, downloadButtonCountryNames[country]);
  };

  const downloadLabel = tFilter("downloadTitle", {
    country: downloadButtonCountryNames[countryFilter],
  });

  return (
    <div
      ref={barRef}
      className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b border-border/60"
    >
      <div className="flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-0">
        <div className="relative flex-1 sm:flex-none min-w-0" ref={countryDropdownRef}>
          <button
            type="button"
            onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
            aria-haspopup="listbox"
            aria-expanded={isCountryMenuOpen}
            className="flex items-center justify-between gap-2 h-11 px-3 sm:px-4 rounded-lg text-sm font-medium bg-secondary/60 hover:bg-secondary text-foreground transition-colors border border-transparent hover:border-border w-full sm:min-w-[220px] cursor-pointer"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-base leading-none">{COUNTRY_FLAGS[countryFilter]}</span>
              <span className="truncate">{countryNames[countryFilter]}</span>
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 shrink-0 transition-transform",
                isCountryMenuOpen && "rotate-180"
              )}
            />
          </button>

          {isCountryMenuOpen && (
            <div
              role="listbox"
              className="absolute left-0 mt-2 w-full sm:w-64 rounded-lg shadow-lg bg-popover border border-border z-50 p-1 animate-in fade-in zoom-in-95 duration-100"
            >
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  type="button"
                  role="option"
                  aria-selected={countryFilter === country}
                  onClick={() => {
                    onCountryChange(country);
                    setIsCountryMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full text-left px-3 py-3 rounded-md text-sm text-popover-foreground hover:bg-muted transition-colors cursor-pointer",
                    countryFilter === country && "bg-muted/60 font-medium"
                  )}
                >
                  <span className="text-base leading-none">{COUNTRY_FLAGS[country]}</span>
                  <span className="flex-1 truncate">{countryNames[country]}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {getHolidayCount[country]}
                  </span>
                  <Check
                    className={cn(
                      "w-4 h-4 shrink-0",
                      countryFilter === country ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleBulkImport(countryFilter)}
          className="flex items-center justify-center gap-2 h-11 w-11 sm:w-auto sm:px-4 shrink-0 rounded-lg text-sm font-medium bg-secondary/60 hover:bg-secondary text-foreground border border-transparent hover:border-border transition-colors cursor-pointer"
          title={downloadLabel}
          aria-label={downloadLabel}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">
            {tFilter("downloadFor", {
              country: downloadButtonCountryNames[countryFilter],
            })}
          </span>
        </button>

        <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg shrink-0 sm:ml-auto">
          <button
            type="button"
            onClick={() => onViewChange("CALENDAR")}
            aria-pressed={view === "CALENDAR"}
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded-md transition-all cursor-pointer",
              view === "CALENDAR"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={tFilter("calendarView")}
            title={tFilter("calendarView")}
          >
            <Calendar className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("LIST")}
            aria-pressed={view === "LIST"}
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded-md transition-all cursor-pointer",
              view === "LIST"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={tFilter("listView")}
            title={tFilter("listView")}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
