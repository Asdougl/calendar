'use client'

import { useState, type FC, useMemo, useRef } from 'react'
import {
  addMonths,
  endOfMonth,
  format,
  getMonth,
  getYear,
  isSameDay,
  set,
  setMonth,
  startOfDay,
  subMonths,
} from 'date-fns'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from '@heroicons/react/24/solid'
import Link from 'next/link'
import { Header1 } from '~/components/ui/headers'
import { cn } from '~/utils/classnames'
import { api } from '~/trpc/react'
import { toCalendarDate, weekDatesOfDateRange } from '~/utils/dates'
import { type RouterOutputs } from '~/trpc/shared'

export const MonthView: FC = () => {
  const [focusMonth, setFocusMonth] = useState(() => {
    const now = new Date()
    const start = startOfDay(set(now, { date: 1 }))
    return {
      start: start,
      end: endOfMonth(start),
    }
  })

  const { data, isLoading } = api.event.range.useQuery({
    start: toCalendarDate(subMonths(focusMonth.start, 1)),
    end: toCalendarDate(addMonths(focusMonth.end, 1)),
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

  const weekDates = useMemo(() => {
    const startOfCurrMonth = set(new Date(), {
      date: 1,
      month: focusMonth.start.getMonth(),
      year: focusMonth.start.getFullYear(),
    })
    const endOfCurrMonth = endOfMonth(startOfCurrMonth)

    return weekDatesOfDateRange(startOfCurrMonth, endOfCurrMonth)
  }, [focusMonth.start])

  const viewNextMonth = () => {
    setFocusMonth((prev) => ({
      start: addMonths(prev.start, 1),
      end: addMonths(prev.end, 1),
    }))
  }

  const viewPrevMonth = () => {
    setFocusMonth((prev) => ({
      start: subMonths(prev.start, 1),
      end: subMonths(prev.end, 1),
    }))
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-grow flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8"></div>
        <Header1 className="text-2xl">
          {format(focusMonth.start, 'MMMM yyyy')}
        </Header1>
        <div className="w-8"></div>
      </header>
      <button
        onClick={viewPrevMonth}
        className="flex w-full items-center justify-center py-2"
      >
        <ChevronUpIcon height={24} />
      </button>
      <div className="flex flex-grow flex-col gap-[2px] overflow-scroll px-[2px]">
        {weekDates.map((week, i) => (
          <Link
            key={week[0]?.toISOString() || i}
            href={`/week?start=${toCalendarDate(week[0] || new Date())}`}
            className="flex flex-1 flex-grow gap-[2px]"
          >
            {week.map((day, j) => {
              const eventsForDay = eventsByDay
                ? eventsByDay[toCalendarDate(day)]
                : []

              return (
                <div
                  key={j}
                  id={toCalendarDate(day)}
                  className={cn(
                    'group flex-1 flex-grow overflow-hidden rounded-lg border border-neutral-800 px-[2px] py-[2px]',
                    j > 4 && 'border-neutral-500',
                    day.getMonth() !== getMonth(focusMonth.start) &&
                      'opacity-50'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={cn(
                        'text-xs',
                        isSameDay(day, new Date()) &&
                          'rounded-full bg-neutral-400 px-1 text-neutral-950'
                      )}
                    >
                      {format(day, 'dd')}
                    </div>
                  </div>
                  {isLoading && (
                    <div className="my-1 h-3 w-full animate-pulse rounded-full bg-neutral-900"></div>
                  )}
                  {eventsForDay?.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'bg-primary-400 truncate whitespace-nowrap rounded-lg text-xs hover:bg-neutral-900',
                        {
                          'opacity-50': event.timestamp < Date.now() / 1000,
                        }
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </Link>
        ))}
      </div>
      <button
        onClick={viewNextMonth}
        className="flex w-full items-center justify-center py-2"
      >
        <ChevronDownIcon height={24} />
      </button>
    </div>
  )
}
