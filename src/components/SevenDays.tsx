'use client'

import { differenceInCalendarDays, setDay } from 'date-fns'
import { type FC } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/solid'
import { PathLink } from './ui/PathLink'
import { stdFormat } from './ui/dates/common'
import { EventModal } from './modals/EventModal'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { eventSort } from '~/utils/sort'

const timeFormat = new Intl.DateTimeFormat('default', {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
})

const DayOfWeekLabel = ({ date }: { date: Date }) => {
  // Using built in formatters because they're
  // "probably" more performant than date-fns

  const isToday = differenceInCalendarDays(date, new Date()) === 0

  return (
    <PathLink
      path="/day/:date"
      params={{ date: stdFormat(date) }}
      className="flex items-center gap-1 rounded px-1 leading-tight lg:hover:bg-neutral-800"
    >
      {isToday && (
        <div className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-50 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-50"></span>
        </div>
      )}
      <span className="font-bold">
        {date.toLocaleString('default', { weekday: 'short' })}
      </span>
      <span className="text-sm">
        {date.getDate().toString().padStart(2, '0')}
      </span>
      <span className="text-sm">
        {date.toLocaleString('default', { month: 'short' })}
      </span>
    </PathLink>
  )
}

type DayOfWeekProps = {
  baseDate: Date
  dayOfWeek: number
  loadingEvents?: boolean
  loadingPeriods?: boolean
  events?: RouterOutputs['event']['range'][]
  periods?: RouterOutputs['periods']['range'][]
  outlines?: boolean
}

const eventItemTime = (event: RouterOutputs['event']['range'][number]) => {
  if (event.timeStatus === 'ALL_DAY') return 'All Day'
  if (event.timeStatus === 'NO_TIME') return ''
  return timeFormat.format(event.datetime)
}

const DayOfWeek: FC<DayOfWeekProps> = ({
  baseDate,
  dayOfWeek,
  events,
  periods,
  loadingEvents,
  outlines = true,
}) => {
  const pathname = usePathname()

  const date = setDay(baseDate, dayOfWeek, { weekStartsOn: 1 })

  const eventsForDay = events?.[dayOfWeek]
    ? events[dayOfWeek]?.toSorted(eventSort) || []
    : []

  const periodsForDay = periods?.[dayOfWeek] || []

  const now = new Date()

  const distanceToToday = differenceInCalendarDays(date, now)

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-neutral-800',
        outlines && {
          'border-neutral-300': distanceToToday === 0,
          'border-neutral-400': distanceToToday === 1,
          'border-neutral-500': distanceToToday === 2,
          'border-neutral-600': distanceToToday === 3,
          'border-neutral-700': distanceToToday === 4,
        }
      )}
    >
      <div className="flex w-full items-center justify-between px-0.5 pt-0.5 md:px-2 md:pt-2">
        <DayOfWeekLabel date={date} />
        <div className="px-1 pt-1">
          {periodsForDay.map((period) => (
            <PathLink
              key={period.id}
              path="/periods/:id"
              params={{ id: period.id }}
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-sm text-xs',
                color('bg')(period.color)
              )}
            >
              {period.icon}
            </PathLink>
          ))}
        </div>
      </div>
      <div className="relative flex flex-grow flex-col overflow-y-auto px-1.5 md:gap-0.5 md:px-3 lg:pb-1">
        {loadingEvents ? (
          <div className="flex justify-between">
            <div className="animate-pulse rounded-full bg-neutral-800 text-xs text-transparent">
              {date.toDateString()}
            </div>
            <div className="animate-pulse rounded-full bg-neutral-800 text-xs text-transparent">
              00:00
            </div>
          </div>
        ) : (
          <>
            {eventsForDay.map((event) => (
              <Link
                key={event.id}
                href={`${pathname}?event=${event.id}`}
                className="flex flex-shrink-0 items-center justify-between overflow-hidden rounded text-sm lg:text-base lg:hover:bg-neutral-900"
              >
                <div className="flex items-center gap-0.5 overflow-hidden">
                  <div
                    className={cn(
                      'h-4 w-0.5 flex-shrink-0 rounded-full',
                      color('bg')(event.category?.color)
                    )}
                  ></div>
                  <span
                    className={cn('truncate', {
                      'text-neutral-500 line-through': event.datetime < now,
                    })}
                  >
                    {event.title}
                  </span>
                </div>
                <div className="whitespace-nowrap text-sm text-neutral-500">
                  {eventItemTime(event)}
                </div>
              </Link>
            ))}
            {distanceToToday >= 0 && (
              <Link
                href={`${pathname}?event=new&date=${date.toISOString()}`}
                className="flex flex-shrink-0 flex-grow flex-col justify-end rounded text-xs lg:hover:bg-neutral-900"
              >
                <span className="flex items-center gap-1 pb-1 text-neutral-500">
                  <PlusIcon height={12} />
                </span>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export type SevenDaysProps = {
  focusDate: Date
  events?: RouterOutputs['event']['range'][]
  periods?: RouterOutputs['periods']['range'][]
  loading?: boolean
  outlines?: boolean
}

export const SevenDays: FC<SevenDaysProps> = ({
  focusDate,
  events,
  periods,
  loading,
  outlines,
}) => {
  return (
    <>
      <div className="grid flex-grow grid-cols-2 gap-1 overflow-hidden">
        <div className="grid grid-rows-2 gap-1 overflow-hidden">
          <DayOfWeek
            baseDate={focusDate}
            dayOfWeek={6}
            events={events}
            periods={periods}
            loadingEvents={loading}
            outlines={outlines}
          />
          <DayOfWeek
            baseDate={focusDate}
            dayOfWeek={0}
            events={events}
            periods={periods}
            loadingEvents={loading}
            outlines={outlines}
          />
        </div>
        <div className="grid grid-rows-5 gap-1 overflow-hidden">
          <DayOfWeek
            baseDate={focusDate}
            dayOfWeek={5}
            events={events}
            periods={periods}
            loadingEvents={loading}
            outlines={outlines}
          />
          <DayOfWeek
            baseDate={focusDate}
            dayOfWeek={4}
            events={events}
            periods={periods}
            loadingEvents={loading}
            outlines={outlines}
          />
          <DayOfWeek
            baseDate={focusDate}
            dayOfWeek={3}
            events={events}
            periods={periods}
            loadingEvents={loading}
            outlines={outlines}
          />
          <DayOfWeek
            baseDate={focusDate}
            dayOfWeek={2}
            events={events}
            periods={periods}
            loadingEvents={loading}
            outlines={outlines}
          />
          <DayOfWeek
            baseDate={focusDate}
            dayOfWeek={1}
            events={events}
            periods={periods}
            loadingEvents={loading}
            outlines={outlines}
          />
        </div>
      </div>
      <EventModal />
    </>
  )
}
