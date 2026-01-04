"use client";

import * as React from "react";
import { Calendar, List, Download, ChevronDown } from "lucide-react";
import { Country } from "@/types";
import { cn } from "@/lib/utils";
import { downloadBulkIcsFile } from "@/lib/calendar";
import { holidays2026 } from "@/data/holidays";

import { ThemeToggle } from "./ThemeToggle";

interface FilterBarProps {
  countryFilter: Country;
  view: "CALENDAR" | "LIST";
  onCountryChange: (country: Country) => void;
  onViewChange: (view: "CALENDAR" | "LIST") => void;
}

export function FilterBar({
  countryFilter,
  view,
  onCountryChange,
  onViewChange,
}: FilterBarProps) {
  const [isImportMenuOpen, setIsImportMenuOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsImportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBulkImport = (country: "AL" | "XK") => {
    const countryHolidays = holidays2026.filter(
      (h) => h.country === country || h.country === "BOTH"
    );
    downloadBulkIcsFile(
      countryHolidays,
      country === "AL" ? "Shqipëri" : "Kosovë"
    );
    setIsImportMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 w-full mb-8 py-4 px-4 bg-background  border-b border-border/40 transition-all">
      <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => onCountryChange("BOTH")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex-1 sm:flex-none",
              countryFilter === "BOTH"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Të gjitha
          </button>
          <button
            onClick={() => onCountryChange("AL")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex-1 sm:flex-none",
              countryFilter === "AL"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Shqipëri
          </button>
          <button
            onClick={() => onCountryChange("XK")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex-1 sm:flex-none",
              countryFilter === "XK"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Kosovë
          </button>
        </div>

        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border w-full sm:w-auto"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Shto në kalendar</span>
            </div>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform",
                isImportMenuOpen && "rotate-180"
              )}
            />
          </button>

          {isImportMenuOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-56 rounded-md shadow-lg bg-popover border border-border z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground border-b border-border/50 mb-1">
                Shkarko të gjitha (.ics)
              </div>
              <button
                onClick={() => handleBulkImport("AL")}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
              >
                🇦🇱 Festat e Shqipërisë
              </button>
              <button
                onClick={() => handleBulkImport("XK")}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
              >
                🇽🇰 Festat e Kosovës
              </button>
              <div className="px-4 py-2 text-[10px] text-muted-foreground italic leading-tight">
                * Mund të importohet në Google, Outlook ose Apple Calendar.
              </div>
            </div>
          )}
        </div>
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
            aria-label="Calendar View"
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
            aria-label="List View"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
