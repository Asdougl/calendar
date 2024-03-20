import { type FC } from 'react'
import { differenceInCalendarDays, format, setDay } from 'date-fns'
import { useDroppable } from '@dnd-kit/core'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ACCESSIBLE_FORMAT, stdFormat } from '../ui/dates/common'
import { EventItem } from './EventItem'
import { useSevenDaysCtx } from './common'
import { type RouterOutputs } from '~/trpc/shared'
import { SEARCH_PARAM_NEW, modifySearchParams } from '~/utils/nav/search'
import { eventSort } from '~/utils/sort'
import { cmerge, cn, color } from '~/utils/classnames'
import { PathLink } from '~/utils/nav/Link'
import { createURL, getWindow } from '~/utils/misc'

const DayOfWeekLabel = ({ date }: { date: Date }) => {
  const { usedIn, week } = useSevenDaysCtx()

  const isToday = differenceInCalendarDays(date, new Date()) === 0

  return (
    <PathLink
      path="/day/:date"
      params={{ date: stdFormat(date) }}
      query={{
        from: usedIn,
        fromWeek: usedIn === 'week' && week ? week : undefined,
      }}
      className="flex items-center gap-1 rounded px-1 leading-tight lg:hover:bg-neutral-800 xl:gap-2"
    >
      {isToday && (
        <div className="relative flex h-2 w-2 items-center justify-center xl:h-2.5 xl:w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-50 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-50 xl:h-2.5 xl:w-2.5"></span>
        </div>
      )}
      <div className="flex items-baseline gap-1">
        <span className="font-bold xl:text-xl">
          {date.toLocaleString('default', { weekday: 'short' })}
        </span>
        <span className="text-sm xl:text-base">
          {date.getDate().toString().padStart(2, '0')}
        </span>
        <span className="text-sm xl:text-base">
          {date.toLocaleString('default', { month: 'short' })}
        </span>
      </div>
    </PathLink>
  )
}

type DayOfWeekProps = {
  dayOfWeek: number
  className?: string
  events?: RouterOutputs['event']['range'][]
  periods?: RouterOutputs['periods']['range'][]
}

const eventLink = (id: string, date?: Date) => {
  const url = createURL(getWindow()?.location.href || '')
  if (url) {
    modifySearchParams({
      update: {
        event: id,
        date: date ? stdFormat(date) : undefined,
      },
      remove: ['period'],
      searchParams: url.searchParams,
    })

    return url.toString()
  } else {
    return '#'
  }
}

const periodLink = (id: string, date?: Date) => {
  const url = new URL(window.location.href)
  modifySearchParams({
    update: {
      period: id,
      date: date ? stdFormat(date) : undefined,
    },
    remove: ['event'],
    searchParams: url.searchParams,
  })
  return url.toString()
}

export const DayOfWeek: FC<DayOfWeekProps> = ({
  dayOfWeek,
  events,
  periods,
  className,
}) => {
  const {
    baseDate,
    weekStart,
    outlines,
    loading: loadingEvents,
  } = useSevenDaysCtx()

  const date = setDay(baseDate, dayOfWeek, { weekStartsOn: weekStart })

  const { setNodeRef, isOver, active } = useDroppable({
    id: stdFormat(date),
  })

  const eventsForDay = events?.[dayOfWeek]
    ? events[dayOfWeek]?.toSorted(eventSort) || []
    : []

  const periodsForDay = periods?.[dayOfWeek] || []

  const distanceToStart = differenceInCalendarDays(date, baseDate)

  return (
    <div
      className={cmerge(
        'flex min-w-0 flex-col rounded-lg border border-neutral-800',
        outlines && {
          'border-neutral-300': distanceToStart === 0,
          'border-neutral-400': distanceToStart === 1,
          'border-neutral-500': distanceToStart === 2,
          'border-neutral-600': distanceToStart === 3,
          'border-neutral-700': distanceToStart === 4,
        },
        {
          'bg-neutral-900': isOver,
        },
        className
      )}
    >
      <div className="flex w-full items-center justify-between px-0.5 pt-0.5 md:px-2 md:pt-2">
        <DayOfWeekLabel date={date} />
        <div className="flex grow items-center gap-2 px-1 pb-0.5">
          {periodsForDay.map((period, _index, arr) => (
            <Link
              key={period.id}
              href={periodLink(period.id)}
              className={cn(
                'flex h-4 w-4 grow items-center justify-end gap-1 overflow-hidden rounded-sm px-0.5 text-xs',
                color('bg')(period.color)
              )}
            >
              <div
                className={cn(
                  'font-bold',
                  {
                    'max-md:hidden': arr.length > 1,
                    'max-lg:hidden': arr.length > 2,
                    hidden: arr.length > 4,
                  },
                  color('alt-text')(period.color)
                )}
              >
                {period.name}
              </div>
              <div>{period.icon}</div>
            </Link>
          ))}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-shrink flex-grow flex-col px-1.5 md:gap-0.5 md:px-3 lg:pb-1',
          { 'overflow-y-auto overflow-x-hidden': !active }
        )}
      >
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
              <EventItem key={event.id} event={event} />
            ))}
            {distanceToStart >= 0 && (
              <Link
                href={eventLink(SEARCH_PARAM_NEW, date)}
                className={cn(
                  'flex flex-shrink-0 flex-grow flex-col justify-end rounded text-xs lg:hover:bg-neutral-900',
                  { 'pointer-events-none hidden': active }
                )}
              >
                <span className="flex items-center gap-1 px-1 pb-1 text-neutral-500">
                  <span className="sr-only">
                    New Event on {format(date, ACCESSIBLE_FORMAT)}
                  </span>
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
