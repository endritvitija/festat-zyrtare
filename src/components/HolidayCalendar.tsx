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

  // Pre-calculate bridge days for the entire year
  const bridgeDays = React.useMemo(() => {
    const bridgeDates = new Set<string>()
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Helper to check if a date is a non-working day (weekend or holiday)
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
        // We hit a non-working day. Check the previous sequence of work days.
        if (currentWorkDaySequence.length > 0 && currentWorkDaySequence.length <= 3) {
          // Check if the sequence was preceded by a non-working day
          const firstDayOfSeq = currentWorkDaySequence[0]
          const prevDay = new Date(firstDayOfSeq)
          prevDay.setDate(prevDay.getDate() - 1)
          
          // If it's the start of the year, we treat it as a boundary, but strictly speaking 
          // a bridge needs a holiday/weekend BEFORE it too. 
          // Assuming Jan 1 is usually a holiday, this works. 
          // If the sequence started at the very beginning of the range, check if prev day (Dec 31) was non-working?
          // For simplicity, we only bridge if bounded by non-working days within our checked range or boundaries.
          // Actually, let's just check if the day BEFORE the sequence was non-working.
          
          if (isNonWorkingDay(prevDay)) {
             // Valid bridge! Add to set.
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
    <div className="space-y-12 max-w-1xl mx-auto">
      {months.map((month) => {
        const monthStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
        const monthEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

        return (
          <div key={month.toString()} className="w-full">
            <h3 className="text-xl font-bold capitalize text-foreground border-b-2 border-border/50 py-4 px-4 sticky top-[128px] sm:top-[72px] z-30 bg-background/95 backdrop-blur-sm">
              {format(month, 'MMMM', { locale: sq })}
            </h3>

            <div className="grid grid-cols-7 text-sm  sticky top-[192px] sm:top-[136px] z-30 bg-background/95 backdrop-blur-sm py-2 px-4 border-b border-border/40">
              {['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'].map(day => (
                <div 
                  key={day} 
                  className={cn(
                    "font-medium py-1",
                    (day === 'Sht' || day === 'Die') ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
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

                if (!isCurrentMonth) {
                  return <div key={day.toString()} className="min-h-[80px]" />
                }

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "min-h-[80px] p-2 rounded-lg border border-transparent transition-all relative group",
                      "hover:border-border hover:bg-muted/30",
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
                        <div className={cn(
                          "absolute bottom-[calc(100%+5px)] w-max max-w-[180px] bg-popover text-popover-foreground text-xs font-medium p-2 rounded-md shadow-md border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center pointer-events-none",
                          day.getDay() === 1 ? "left-0 translate-x-0" : // Monday
                          day.getDay() === 0 ? "right-0 translate-x-0" : // Sunday
                          "left-1/2 -translate-x-1/2" // Others
                        )}>
                          {holiday.name}
                          <div className={cn(
                            "absolute top-full border-4 border-transparent border-t-popover ml-[-1px] mt-[-1px]",
                            day.getDay() === 1 ? "left-4" :
                            day.getDay() === 0 ? "right-4" :
                            "left-1/2 -translate-x-1/2"
                          )}></div>
                        </div>
                      </div>
                    )}

                    {isBridgeDay && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={cn(
                          "absolute bottom-[calc(100%+5px)] w-max max-w-[200px] bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 text-xs font-medium p-2 rounded-md shadow-md border border-yellow-200 dark:border-yellow-800 z-50 text-center pointer-events-none",
                          day.getDay() === 1 ? "left-0 translate-x-0" : // Monday
                          day.getDay() === 0 ? "right-0 translate-x-0" : // Sunday
                          "left-1/2 -translate-x-1/2" // Others
                        )}>
                          Rekomandim për të marrë një ditë pushimi
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
