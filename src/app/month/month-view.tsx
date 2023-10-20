'use client'

import { useState, type FC, useMemo } from 'react'
import { endOfMonth, getMonth, getYear, set } from 'date-fns'
import { Header1 } from '~/components/ui/headers'
import { cn } from '~/utils/classnames'
import { api } from '~/trpc/react'
import { getMonthDates, toCalendarDate } from '~/utils/dates'
import { type RouterOutputs } from '~/trpc/shared'

export const MonthView: FC = () => {
  const [focusMonth, setFocusMonth] = useState({
    month: getMonth(new Date()),
    year: getYear(new Date()),
  })

  const startOfMonthDate = set(new Date(), {
    date: 1,
    month: focusMonth.month,
    year: focusMonth.year,
  })

  const endOfMonthDate = endOfMonth(startOfMonthDate)

  const { data, isLoading } = api.event.range.useQuery({
    start: toCalendarDate(startOfMonthDate),
    end: toCalendarDate(startOfMonthDate),
  })

  const eventsByDay = useMemo(() => {
    if (!data) return {}
    const eventsByDay: Record<string, RouterOutputs['event']['range']> = {}
    data.forEach((event) => {
      const eventsOfDay = eventsByDay[event.date]
      if (eventsOfDay) eventsOfDay.push(event)
      else eventsByDay[event.date] = [event]
    })
    return eventsByDay
  }, [data])

  // eslint-disable-next-line no-console
  console.log(data, isLoading, setFocusMonth)

  const monthDates = useMemo(() => {
    return getMonthDates(focusMonth.year, focusMonth.month)
  }, [focusMonth.month, focusMonth.year])

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8"></div>
        <Header1 className="text-2xl">Month</Header1>
        <div className="w-8"></div>
      </header>
      <div className="flex flex-col gap-1">
        {monthDates.map((week, i) => (
          <div key={i} className="flex flex-row gap-1">
            {week.map((day, j) => {
              const eventsForDay = eventsByDay[toCalendarDate(day)]

              return (
                <div
                  key={j}
                  className={cn(
                    'h-32 flex-1 flex-grow rounded-lg border border-neutral-800 px-2 py-1',
                    { 'relative mr-4': j === 4 }
                  )}
                >
                  {day.getDate()}
                  {j === 4 && (
                    <div className="absolute -right-3 top-0 -ml-px h-full w-px bg-neutral-500"></div>
                  )}
                  {eventsForDay?.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'bg-primary-400 rounded-lg p-1 hover:bg-neutral-900',
                        {
                          'opacity-50': event.timestamp < Date.now(),
                        }
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
