"use client"

import * as React from "react"
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
  endOfYear
} from "date-fns"
import { sq } from "date-fns/locale"
import { Holiday, Country } from "@/types"
import { cn } from "@/lib/utils"

interface HolidayCalendarProps {
  holidays: Holiday[]
  countryFilter: Country
}

export function HolidayCalendar({ holidays, countryFilter }: HolidayCalendarProps) {
  const year = 2026
  const startDate = startOfYear(new Date(year, 0, 1))
  const endDate = endOfYear(new Date(year, 0, 1))
  
  const months = React.useMemo(() => {
    return eachMonthOfInterval({ start: startDate, end: endDate })
  }, [startDate, endDate])

  const filteredHolidays = React.useMemo(() => {
    return holidays.filter(h => 
      countryFilter === 'BOTH' || h.country === 'BOTH' || h.country === countryFilter
    )
  }, [holidays, countryFilter])

  const getHolidayForDate = (date: Date) => {
    return filteredHolidays.find(h => h.date === format(date, 'yyyy-MM-dd'))
  }

  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      {months.map((month) => {
        const monthStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
        const monthEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

        return (
          <div key={month.toString()} className="w-full">
            <h3 className="text-xl font-bold capitalize mb-4 text-foreground border-b border-border pb-2">
              {format(month, 'MMMM', { locale: sq })}
            </h3>

            <div className="grid grid-cols-7 text-sm mb-2">
              {['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'].map(day => (
                <div key={day} className="text-muted-foreground font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const holiday = getHolidayForDate(day)
                const isCurrentMonth = isSameMonth(day, month)
                const isWknd = isWeekend(day)

                if (!isCurrentMonth) {
                  return <div key={day.toString()} className="min-h-[80px]" />
                }

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "min-h-[80px] p-2 rounded-lg border border-transparent transition-all relative group",
                      "hover:border-border hover:bg-muted/30",
                      holiday ? "bg-orange-50 dark:bg-orange-950/20" : "bg-card",
                      isWknd && !holiday && "bg-muted/5",
                      isSameDay(day, new Date()) && "border-blue-500 ring-1 ring-blue-500 shadow-sm z-10"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium block mb-1",
                        holiday ? "text-orange-600 dark:text-orange-400" : "text-foreground",
                        isWknd && !holiday && "text-muted-foreground"
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    
                    {holiday && (
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {holiday.country === 'AL' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          {holiday.country === 'XK' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          {holiday.country === 'BOTH' && (
                            <div className="flex gap-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] leading-tight font-medium text-muted-foreground line-clamp-2 hidden sm:block">
                          {holiday.name}
                        </span>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-[calc(100%+5px)] left-1/2 -translate-x-1/2 w-max max-w-[180px] bg-popover text-popover-foreground text-xs font-medium p-2 rounded-md shadow-md border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center pointer-events-none">
                          {holiday.name}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover ml-[-1px] mt-[-1px]"></div>
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
