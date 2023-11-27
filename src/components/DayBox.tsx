'use client'

import { differenceInDays, format, getDay, setDay, startOfDay } from 'date-fns'
import type { FC } from 'react'
import { useMemo } from 'react'
import { EventDialog } from './EventDialog'
import { EventItem } from './EventItem'
import { CategoryIcon } from './CategoryIcon'
import { PathLink } from './ui/PathLink'
import { cn, getCategoryColor } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'
import { useOrigination } from '~/utils/atoms'

export const DayBox: FC<{
  focusDate: Date
  dayOfWeek: number
  events: NonNullable<RouterOutputs['event']['range']>
  isLoading: boolean
  periods?: NonNullable<RouterOutputs['periods']['range']>
  startToday?: boolean
  focusEvent?: string
}> = ({
  focusDate,
  dayOfWeek,
  events,
  isLoading,
  startToday,
  periods = [],
  focusEvent,
}) => {
  const day = useMemo(() => {
    return startOfDay(
      setDay(focusDate, dayOfWeek, {
        weekStartsOn: startToday ? getDay(new Date()) : 1,
      })
    )
  }, [focusDate, dayOfWeek, startToday])

  const isWeekend = focusDate.getDay() === 0 || focusDate.getDay() === 6

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

  const distanceToToday = differenceInDays(day, new Date())

  const [originating] = useOrigination()

  return (
    <div
      className={cn(
        'flex flex-1 flex-col overflow-hidden rounded-lg border border-neutral-800 px-1 py-1',
        { 'border-neutral-400': distanceToToday === 0 },
        startToday && {
          'border-neutral-500': distanceToToday === 1,
          'border-neutral-600': distanceToToday === 2,
        },
        periods.length === 1 && getCategoryColor(periods[0]?.color, 'border')
      )}
    >
      <div className="flex justify-between px-1">
        <div className="flex items-baseline gap-1">
          <PathLink
            path="/day/:date"
            params={{ date: format(day, 'yyyy-MM-dd') }}
            className="flex items-baseline gap-1 border-b border-transparent lg:hover:border-neutral-200"
          >
            <div className="font-bold">{format(day, 'E')}</div>
            <div className="text-sm">{format(day, 'd MMM')}</div>
          </PathLink>
          {periods.map((period) => (
            <PathLink
              key={period.id}
              path="/periods/:id"
              params={{ id: period.id }}
              query={{ origin: originating }}
            >
              <CategoryIcon
                icon={
                  periods.length === 1
                    ? `${period.icon} ${period.name}`
                    : period.icon
                }
                color={period.color}
                size="sm"
              />
            </PathLink>
          ))}
        </div>
        <EventDialog initialDate={day} />
      </div>
      <ul className="flex flex-grow flex-col gap-0.5 overflow-hidden lg:gap-1">
        {isLoading ? (
          <li className="my-2 h-4 w-3/4 animate-pulse rounded-full bg-neutral-900"></li>
        ) : (
          sortedEvents.map((event, i, array) => (
            <EventItem
              key={event.id}
              event={event}
              startOpen={event.id === focusEvent}
              count={array.length}
              isWeekend={isWeekend}
            />
          ))
        )}
        <li className="w-full flex-1">
          <EventDialog initialDate={day}>
            <button className="h-full w-full"></button>
          </EventDialog>
        </li>
      </ul>
    </div>
  )
}
