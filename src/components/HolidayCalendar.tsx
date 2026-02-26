"use client";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWeekend,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";
import { sq, enUS, de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Holiday, Country } from "@/types";
import { cn } from "@/lib/utils";

const dateFnsLocaleMap = { sq, en: enUS, de } as const;

interface HolidayCalendarProps {
  holidays: Holiday[]
  countryFilter: Country
}

export function HolidayCalendar({ holidays, countryFilter }: HolidayCalendarProps) {
  const locale = useLocale() as "sq" | "en" | "de";
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? sq;
  const tCountries = useTranslations("countries");
  const tCommon = useTranslations("common");
  const tWd = useTranslations("weekdaysShort");
  const weekdaysShort = [
    tWd("0"),
    tWd("1"),
    tWd("2"),
    tWd("3"),
    tWd("4"),
    tWd("5"),
    tWd("6"),
  ];

  const countryFlags: Record<Country, string> = {
    AL: "🇦🇱",
    XK: "🇽🇰",
    ME: "🇲🇪",
    MK: "🇲🇰",
    BOTH: "🌍",
  };

  const countryNames: Record<Country, string> = {
    AL: tCountries("AL"),
    XK: tCountries("XK"),
    ME: tCountries("ME"),
    MK: tCountries("MK"),
    BOTH: tCountries("BOTH"),
  };

  const getDisplayCountry = (holiday: Holiday): string => {
    if (holiday.country === 'BOTH') {
      return countryFilter === 'BOTH' ? countryNames['BOTH'] : countryNames[countryFilter];
    }
    return countryNames[holiday.country];
  };
  
  const year = 2026
  const startDate = startOfYear(new Date(year, 0, 1))
  const endDate = endOfYear(new Date(year, 0, 1))
  const [activeDate, setActiveDate] = React.useState<string | null>(null)
  
  const months = React.useMemo(() => {
    return eachMonthOfInterval({ start: startDate, end: endDate })
  }, [startDate, endDate])

  const calendarContainerRef = React.useRef<HTMLDivElement>(null)

  // Scroll to current month on open
  React.useEffect(() => {
    const scrollToMonthId = `${year}-${format(new Date(), "MM")}`
    const el = calendarContainerRef.current?.querySelector(
      `[data-month="${scrollToMonthId}"]`
    ) as HTMLElement | null
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  // Close tooltip when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-date-cell]')) {
        setActiveDate(null)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const filteredHolidays = React.useMemo(() => {
    return holidays.filter(h => 
      countryFilter === 'BOTH' || h.country === 'BOTH' || h.country === countryFilter
    )
  }, [holidays, countryFilter])

  const bridgeDays = React.useMemo(() => {
    const bridgeDates = new Set<string>()
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    
    const isNonWorkingDay = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const isWknd = isWeekend(date)
      const isHoliday = holidays.some(h => h.date === dateStr && (countryFilter === 'BOTH' || h.country === 'BOTH' || h.country === countryFilter))
      return isWknd || isHoliday
    }

    let currentWorkDaySequence: Date[] = []

    for (let i = 0; i < allDays.length; i++) {
      const day = allDays[i]
      
      if (isNonWorkingDay(day)) {
        if (currentWorkDaySequence.length > 0 && currentWorkDaySequence.length <= 3) {
          const firstDayOfSeq = currentWorkDaySequence[0]
          const prevDay = new Date(firstDayOfSeq)
          prevDay.setDate(prevDay.getDate() - 1)
          
          if (isNonWorkingDay(prevDay)) {
             currentWorkDaySequence.forEach(d => bridgeDates.add(format(d, 'yyyy-MM-dd')))
          }
        }
        currentWorkDaySequence = []
      } else {
        currentWorkDaySequence.push(day)
      }
    }
    
    return bridgeDates
  }, [startDate, endDate, holidays, countryFilter])

  const getHolidayForDate = (date: Date) => {
    return filteredHolidays.find(h => h.date === format(date, 'yyyy-MM-dd'))
  }

  return (
    <div ref={calendarContainerRef} className="space-y-12 max-w-1xl mx-auto">
      {months.map((month) => {
        const monthStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
        const monthEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

        return (
          <div
            key={month.toString()}
            data-month={format(month, "yyyy-MM")}
            className="w-full"
          >
            <h3 className="text-xl font-bold capitalize text-foreground py-4 px-4 sticky top-[180px] sm:top-[72px] z-30 bg-background/95 backdrop-blur-sm">
              {format(month, "MMMM", { locale: dateFnsLocale })}
            </h3>

            <div className="grid grid-cols-7 text-sm sticky top-[240px] sm:top-[132px] z-30 bg-background/95 backdrop-blur-sm py-2 px-4 border-b-2 border-border/50">
              {weekdaysShort.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "font-medium py-1",
                    ["Sht", "Die", "Sat", "Sun", "Sa", "So"].includes(day)
                      ? "text-red-500 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 mt-2 gap-px rounded-lg overflow-hidden border-border/50 mx-4 sm:mx-0">
              {days.map((day) => {
                const holiday = getHolidayForDate(day)
                const isCurrentMonth = isSameMonth(day, month)
                const isWknd = isWeekend(day)
                const dateStr = format(day, 'yyyy-MM-dd')
                const isBridgeDay = bridgeDays.has(dateStr)
                const dayNumber = parseInt(format(day, 'd'))
                const isFirstRow = isCurrentMonth && dayNumber <= 7

                if (!isCurrentMonth) {
                  return <div key={day.toString()} className="min-h-[80px]" />
                }

                const isActive = activeDate === dateStr
                
                return (
                  <div
                    key={day.toString()}
                    data-date-cell
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDate(isActive ? null : dateStr)
                    }}
                    className={cn(
                      "min-h-[80px] p-2 rounded-lg border border-transparent transition-all relative group cursor-pointer",
                      "hover:border-border hover:bg-muted/30",
                      isActive && "border-border bg-muted/30",
                      holiday ? "bg-orange-50 dark:bg-orange-950/20" : 
                      isBridgeDay ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-card",
                      isWknd && !holiday && "bg-gray-100/80 dark:bg-gray-800/40",
                      isSameDay(day, new Date()) && "border-blue-500 ring-1 ring-blue-500 shadow-sm z-10"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium block mb-1",
                        holiday ? "text-orange-600 dark:text-orange-400" : 
                        isBridgeDay ? "text-yellow-600 dark:text-yellow-400" : "text-foreground",
                        isWknd && !holiday && "text-muted-foreground"
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    
                    {holiday && (
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 items-center">
                          {holiday.country === 'BOTH' ? (
                            countryFilter === 'BOTH' ? (
                              <>
                                {/* Mobile: multi-colored pill icon */}
                                <div className="flex items-center sm:hidden">
                                  <div className="w-4 h-2 rounded-full flex overflow-hidden shadow-sm">
                                    <div className="w-1/4 bg-red-500"></div>
                                    <div className="w-1/4 bg-blue-500"></div>
                                    <div className="w-1/4 bg-green-500"></div>
                                    <div className="w-1/4 bg-purple-500"></div>
                                  </div>
                                </div>
                                {/* Desktop: all flags */}
                                <div className="hidden sm:flex gap-0.5">
                                  <span className="text-base leading-none">{countryFlags['AL']}</span>
                                  <span className="text-base leading-none">{countryFlags['XK']}</span>
                                  <span className="text-base leading-none">{countryFlags['ME']}</span>
                                  <span className="text-base leading-none">{countryFlags['MK']}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Mobile: single colored pill */}
                                <div className="flex items-center sm:hidden">
                                  <div className={cn(
                                    "w-4 h-2 rounded-full shadow-sm",
                                    countryFilter === 'AL' && "bg-red-500",
                                    countryFilter === 'XK' && "bg-blue-500",
                                    countryFilter === 'ME' && "bg-green-500",
                                    countryFilter === 'MK' && "bg-purple-500"
                                  )}></div>
                                </div>
                                {/* Desktop: flag */}
                                <span className="hidden sm:inline text-base leading-none">{countryFlags[countryFilter]}</span>
                              </>
                            )
                          ) : (
                            <>
                              {/* Mobile: single colored pill */}
                              <div className="flex items-center sm:hidden">
                                <div className={cn(
                                  "w-4 h-2 rounded-full shadow-sm",
                                  holiday.country === 'AL' && "bg-red-500",
                                  holiday.country === 'XK' && "bg-blue-500",
                                  holiday.country === 'ME' && "bg-green-500",
                                  holiday.country === 'MK' && "bg-purple-500"
                                )}></div>
                              </div>
                              {/* Desktop: flag */}
                              <span className="hidden sm:inline text-base leading-none">{countryFlags[holiday.country]}</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] leading-tight font-medium text-muted-foreground line-clamp-2 hidden sm:block">
                          {holiday.name}
                        </span>
                          
                        <div className={cn(
                          "absolute w-max max-w-[200px] bg-popover text-popover-foreground text-xs font-medium p-3 rounded-md shadow-lg border border-border transition-all duration-200 z-50 text-center",
                          isFirstRow ? "top-[calc(100%+5px)]" : "bottom-[calc(100%+5px)]",
                          isActive ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                          day.getDay() === 1 ? "left-0 translate-x-0" :
                          day.getDay() === 0 ? "right-0 translate-x-0" :
                          "left-1/2 -translate-x-1/2"
                        )}>
                          <div className="mb-2 font-bold">{holiday.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {getDisplayCountry(holiday)}
                          </div>
                          <div className={cn(
                            isFirstRow 
                              ? "absolute bottom-full border-4 border-transparent border-b-popover mb-[-1px]"
                              : "absolute top-full border-4 border-transparent border-t-popover mt-[-1px]",
                            day.getDay() === 1 ? "left-4" :
                            day.getDay() === 0 ? "right-4" :
                            "left-1/2 -translate-x-1/2"
                          )}></div>
                        </div>
                      </div>
                    )}

                    {isBridgeDay && (
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity",
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <div className={cn(
                          "absolute bottom-[calc(100%+5px)] w-max max-w-[200px] bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 text-xs font-medium p-2 rounded-md shadow-md border border-yellow-200 dark:border-yellow-800 z-50 text-center pointer-events-none",
                          day.getDay() === 1 ? "left-0 translate-x-0" :
                          day.getDay() === 0 ? "right-0 translate-x-0" :
                          "left-1/2 -translate-x-1/2"
                        )}>
                          {tCommon("recommendationTooltip")}
                          <div className={cn(
                            "absolute top-full border-4 border-transparent border-t-yellow-100 dark:border-t-yellow-900 ml-[-1px] mt-[-1px]",
                            day.getDay() === 1 ? "left-4" :
                            day.getDay() === 0 ? "right-4" :
                            "left-1/2 -translate-x-1/2"
                          )}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
