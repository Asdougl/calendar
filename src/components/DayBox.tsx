'use client'

import { format, getDay, getDayOfYear, setDay, startOfDay } from 'date-fns'
import type { FC } from 'react'
import { useMemo } from 'react'
import { EventDialog } from './EventDialog'
import { EventItem } from './EventItem'
import { CategoryIcon } from './CategoryIcon'
import { cn, getCategoryColor } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'

export const DayBox: FC<{
  focusDate: Date
  dayOfWeek: number
  events: NonNullable<RouterOutputs['event']['range']>
  isLoading: boolean
  periods?: NonNullable<RouterOutputs['periods']['range']>
  startToday?: boolean
}> = ({
  focusDate,
  dayOfWeek,
  events,
  isLoading,
  startToday,
  periods = [],
}) => {
  const day = useMemo(() => {
    return startOfDay(
      setDay(focusDate, dayOfWeek, {
        weekStartsOn: startToday ? getDay(new Date()) : 1,
      })
    )
  }, [focusDate, dayOfWeek, startToday])

  const sortedEvents = useMemo(() => {
    const pastEvents: RouterOutputs['event']['range'] = []
    const futureEvents: RouterOutputs['event']['range'] = []
    const allDayEvents: RouterOutputs['event']['range'] = []
    const now = new Date().getTime()
    events.forEach((event) => {
      if (event.timeStatus !== 'STANDARD') allDayEvents.push(event)
      else if (event.datetime.getTime() < now) pastEvents.push(event)
      else futureEvents.push(event)
    })
    return [...allDayEvents, ...futureEvents, ...pastEvents]
  }, [events])

  const distanceToToday = getDayOfYear(day) - getDayOfYear(new Date())

  const shouldCondense = events.length > 2 && dayOfWeek < 6

  return (
    <div
      className={cn(
        'flex-1 overflow-hidden rounded-lg border border-neutral-800 px-2 py-1',
        { 'border-neutral-400': distanceToToday === 0 },
        startToday && {
          'border-neutral-500': distanceToToday === 1,
          'border-neutral-600': distanceToToday === 2,
        },
        periods.length === 1 && getCategoryColor(periods[0]?.color, 'border')
      )}
    >
      <div className="flex justify-between">
        <div
          className={cn(
            'flex items-baseline gap-1',
            startToday
              ? {
                  'opacity-40': distanceToToday === 6,
                  'opacity-60': distanceToToday === 5,
                  'opacity-80': distanceToToday === 4,
                }
              : {
                  'opacity-60': distanceToToday < 0,
                }
          )}
        >
          <div className="font-bold">{format(day, 'E')}</div>
          <div className="text-sm">{format(day, 'd MMM')}</div>
          {periods.map((period) => (
            <CategoryIcon
              key={period.id}
              icon={
                periods.length === 1
                  ? `${period.icon} ${period.name}`
                  : period.icon
              }
              color={period.color}
              size="sm"
            />
          ))}
        </div>
        <EventDialog initialDate={day} />
      </div>
      <ul className="flex flex-col gap-1 overflow-scroll py-1">
        {isLoading ? (
          <li className="my-2 h-4 w-3/4 animate-pulse rounded-full bg-neutral-900"></li>
        ) : (
          sortedEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              condensed={shouldCondense}
            />
          ))
        )}
      </ul>
    </div>
  )
}
