'use client'

import {
  differenceInCalendarDays,
  format,
  getDay,
  setDay,
  startOfDay,
} from 'date-fns'
import type { FC } from 'react'
import { useMemo } from 'react'
import { EventDialog } from './EventDialog'
import { EventItem } from './EventItem'
import { PathLink } from './ui/PathLink'
import { ViewPeriod } from './ViewPeriod'
import { cn } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'

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

  const distanceToToday = differenceInCalendarDays(day, new Date())

  return (
    <div
      className={cn(
        'flex flex-1 flex-col overflow-hidden rounded-lg border border-neutral-800 px-1 py-1',
        startToday && {
          'border-neutral-400': distanceToToday === 0,
          'border-neutral-500': distanceToToday === 1,
          'border-neutral-600': distanceToToday === 2,
        }
      )}
    >
      <div className="flex justify-between">
        <div className="flex items-baseline gap-1">
          <PathLink
            path="/day/:date"
            params={{ date: format(day, 'yyyy-MM-dd') }}
            className={cn(
              'group flex items-center gap-1 border-b border-transparent px-1'
            )}
          >
            {distanceToToday === 0 && (
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-50 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-50"></span>
              </span>
            )}
            <div
              className={cn('lg:hover:underline', {
                'line-through opacity-50': distanceToToday < 0,
              })}
            >
              <span className="font-bold">{format(day, 'E')}</span>{' '}
              <span className="text-sm font-normal">
                {format(day, 'd MMM')}
              </span>
            </div>
          </PathLink>
          {periods.map((period) => (
            <ViewPeriod key={period.id} period={period}>
              <button type="button" className="text-xs">
                {period.icon}
              </button>
            </ViewPeriod>
          ))}
        </div>
        {distanceToToday >= 0 && <EventDialog initialDate={day} />}
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
        {distanceToToday >= 0 && (
          <li className="w-full flex-1">
            <EventDialog initialDate={day}>
              <button className="h-full w-full"></button>
            </EventDialog>
          </li>
        )}
      </ul>
    </div>
  )
}
