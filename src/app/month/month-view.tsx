'use client'

import { useState, type FC, useMemo } from 'react'
import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  getISOWeek,
  getMonth,
  isAfter,
  isBefore,
  isSameDay,
  set,
  startOfDay,
  subDays,
  subMonths,
} from 'date-fns'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { Header1 } from '~/components/ui/headers'
import { cn, getCategoryColor } from '~/utils/classnames'
import { api } from '~/trpc/react'
import { time, toCalendarDate, weekDatesOfDateRange } from '~/utils/dates'
import { type RouterOutputs } from '~/trpc/shared'
import { PathLink } from '~/components/ui/PathLink'

export const MonthView: FC = () => {
  const [focusMonth, setFocusMonth] = useState(() => {
    const now = new Date()
    const start = startOfDay(set(now, { date: 1 }))
    return {
      start: start,
      end: endOfMonth(start),
    }
  })

  const queryClient = api.useContext()

  const { data, isFetching } = api.event.range.useQuery(
    {
      start: startOfDay(subDays(focusMonth.start, 7)),
      end: endOfDay(addDays(focusMonth.end, 7)),
    },
    {
      placeholderData: () => {
        const toReturn: RouterOutputs['event']['range'] = []
        const lastMonthData = queryClient.event.range.getData({
          start: startOfDay(subDays(subMonths(focusMonth.start, 1), 7)),
          end: endOfDay(addDays(endOfMonth(subMonths(focusMonth.start, 1)), 7)),
        })
        if (lastMonthData)
          toReturn.push(
            ...lastMonthData.filter((event) =>
              isAfter(
                event.datetime,
                subDays(focusMonth.start, 7).getTime() / 1000
              )
            )
          )
        const nextMonthData = queryClient.event.range.getData({
          start: startOfDay(subDays(addMonths(focusMonth.start, 1), 7)),
          end: endOfDay(addDays(endOfMonth(addMonths(focusMonth.start, 1)), 7)),
        })

        if (nextMonthData)
          toReturn.push(
            ...nextMonthData.filter((event) =>
              isBefore(
                event.datetime,
                addDays(focusMonth.end, 7).getTime() / 1000
              )
            )
          )

        return toReturn
      },
      staleTime: time.minutes(1),
      refetchInterval: time.minutes(5),
    }
  )

  const eventsByDay = useMemo(() => {
    if (!data) return {}
    const eventsByDay: Record<string, RouterOutputs['event']['range']> = {}
    data.forEach((event) => {
      const dayKey = format(event.datetime, 'yyyy-MM-dd')
      const eventsOfDay = eventsByDay[dayKey]
      if (eventsOfDay) eventsOfDay.push(event)
      else eventsByDay[dayKey] = [event]
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
        className="flex w-full items-center justify-center rounded-lg py-2 hover:bg-neutral-900"
      >
        <ChevronUpIcon height={24} />
      </button>
      <div className="flex flex-grow flex-col gap-1 overflow-scroll px-[2px]">
        {weekDates.map((week, i) => (
          <PathLink
            key={
              week[0] ? `${format(week[0], 'yy')}w${getISOWeek(week[0])}` : i
            }
            path="/week"
            query={{
              start: toCalendarDate(week[0] || new Date()),
              random: Math.random().toString(36).substring(2, 7),
            }}
            className="group flex flex-1 flex-grow"
          >
            {week.map((day, j) => {
              const eventsForDay = eventsByDay
                ? eventsByDay[toCalendarDate(day)]
                : []

              const inCurrMonth = day.getMonth() === getMonth(focusMonth.start)

              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  id={toCalendarDate(day)}
                  className={cn(
                    'group flex flex-1 flex-grow flex-col gap-0.5 overflow-hidden border border-r-0 border-neutral-800 px-[2px] py-[2px] first:rounded-l-lg last:rounded-r-lg last:border-r md:group-hover:border-neutral-600 md:group-hover:bg-neutral-900',
                    j > 4 && 'bg-neutral-900',
                    !inCurrMonth && 'opacity-50'
                  )}
                >
                  {/* needs to be wrapped in a flex because parent can't be a flex */}
                  {/* if we want the event title to overflow into ellipsis */}
                  <div className="flex">
                    <div
                      className={cn(
                        'px-1 text-xs',
                        isSameDay(day, new Date()) &&
                          'rounded-full bg-neutral-50 text-neutral-950'
                      )}
                    >
                      {format(day, 'EE dd')}
                    </div>
                  </div>
                  {isFetching && (!eventsForDay || eventsForDay.length < 1) && (
                    <div className="px-2 pt-1">
                      <div className="h-3 w-full animate-pulse rounded-full bg-neutral-800"></div>
                    </div>
                  )}
                  {eventsForDay?.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'relative flex flex-col gap-0.5 pl-2 hover:bg-neutral-900',
                        {
                          'animate-pulse opacity-50': isFetching,
                        }
                      )}
                    >
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-full w-1 rounded-lg',
                          getCategoryColor(event.category?.color, 'bg')
                        )}
                      ></div>
                      <div
                        className={cn(
                          'truncate whitespace-nowrap text-xs',
                          event.datetime.getTime() < Date.now() &&
                            'line-through opacity-50'
                        )}
                      >
                        {event.title}
                      </div>
                      <div className="-mt-1 hidden text-xs opacity-50 md:block">
                        {format(event.datetime, 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </PathLink>
        ))}
      </div>
      <button
        onClick={viewNextMonth}
        className="flex w-full items-center justify-center rounded-lg py-2 hover:bg-neutral-900"
      >
        <ChevronDownIcon height={24} />
      </button>
    </div>
  )
}
