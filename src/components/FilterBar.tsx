"use client"

import * as React from "react"
import { Calendar, List, Check } from "lucide-react"
import { Country } from "@/types"
import { cn } from "@/lib/utils"

import { ThemeToggle } from "./ThemeToggle"

interface FilterBarProps {
  countryFilter: Country
  view: 'CALENDAR' | 'LIST'
  onCountryChange: (country: Country) => void
  onViewChange: (view: 'CALENDAR' | 'LIST') => void
}

export function FilterBar({
  countryFilter,
  view,
  onCountryChange,
  onViewChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 w-full mb-8 py-4 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 transition-all">
      <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
        <button
          onClick={() => onCountryChange('BOTH')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
            countryFilter === 'BOTH'
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Të gjitha
        </button>
        <button
          onClick={() => onCountryChange('AL')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
            countryFilter === 'AL'
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          🇦🇱 Shqipëri
        </button>
        <button
          onClick={() => onCountryChange('XK')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
            countryFilter === 'XK'
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          🇽🇰 Kosovë
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => onViewChange('CALENDAR')}
            className={cn(
              "p-2 rounded-md transition-all cursor-pointer",
              view === 'CALENDAR'
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Calendar View"
          >
            <Calendar className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewChange('LIST')}
            className={cn(
              "p-2 rounded-md transition-all cursor-pointer",
              view === 'LIST'
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
  )
}
