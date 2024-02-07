'use client'

import { differenceInCalendarDays, set, setDay } from 'date-fns'
import { type FC } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/solid'
import {
  DndContext,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  useSensor,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core'
import { PathLink } from './ui/PathLink'
import { stdFormat } from './ui/dates/common'
import { EventModal } from './modals/EventModal'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { eventSort } from '~/utils/sort'
import { api } from '~/trpc/react'

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

const EventItem = ({
  event,
}: {
  event: RouterOutputs['event']['range'][number]
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const now = new Date()

  return (
    <Link
      href={eventLink(event.id)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        'flex flex-shrink-0 items-center justify-between rounded text-sm lg:text-base lg:hover:bg-neutral-900',
        { 'pointer-events-none z-10': isDragging }
      )}
    >
      <div className="flex min-w-0 items-center gap-0.5">
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
  weekStart?: 0 | 1 | 6 | 3 | 2 | 4 | 5
}

const eventItemTime = (event: RouterOutputs['event']['range'][number]) => {
  if (event.timeStatus === 'ALL_DAY') return 'All Day'
  if (event.timeStatus === 'NO_TIME') return ''
  return timeFormat.format(event.datetime)
}

const eventLink = (id: string) => {
  const url = new URL(window.location.href)

  url.searchParams.set('event', id)

  return url.toString()
}

const DayOfWeek: FC<DayOfWeekProps> = ({
  baseDate,
  dayOfWeek,
  events,
  periods,
  loadingEvents,
  outlines = true,
  weekStart = 1,
}) => {
  const pathname = usePathname()

  const date = setDay(baseDate, dayOfWeek, { weekStartsOn: weekStart })

  const { setNodeRef, isOver } = useDroppable({
    id: stdFormat(date),
  })

  const eventsForDay = events?.[dayOfWeek]
    ? events[dayOfWeek]?.toSorted(eventSort) || []
    : []

  const periodsForDay = periods?.[dayOfWeek] || []

  const distanceToStart = differenceInCalendarDays(date, baseDate)

  return (
    <div
      className={cn(
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
      <div
        ref={setNodeRef}
        className="relative flex flex-grow flex-col px-1.5 md:gap-0.5 md:px-3 lg:pb-1"
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
                href={`${pathname}?event=new&date=${stdFormat(date)}`}
                className={cn(
                  'flex flex-shrink-0 flex-grow flex-col justify-end rounded text-xs lg:hover:bg-neutral-900',
                  { 'pointer-events-none -z-10': isOver }
                )}
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
  start: Date
  end: Date
  events?: RouterOutputs['event']['range'][]
  periods?: RouterOutputs['periods']['range'][]
  loading?: boolean
  outlines?: boolean
  weekStart?: 0 | 1 | 6 | 3 | 2 | 4 | 5
}

export const SevenDays: FC<SevenDaysProps> = ({
  start,
  end,
  events,
  periods,
  loading,
  outlines,
  weekStart,
}) => {
  const queryClient = api.useUtils()

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })

  const { mutate } = api.event.update.useMutation({
    onMutate: (data) => {
      if (data.datetime) {
        const curr = queryClient.event.range.getData({ start, end })

        if (curr) {
          const modifiedEventIndex = curr.findIndex(
            (event) => event.id === data.id
          )
          if (modifiedEventIndex > -1) {
            const copy = [...curr]
            const [event] = copy.splice(modifiedEventIndex, 1)

            if (event) {
              const newEvent = { ...event, ...data }

              copy.push(newEvent)

              queryClient.event.range.setData({ start, end }, copy)
            }
          }
        }

        return { previousValue: curr }
      }
    },
    onSuccess: () => {
      queryClient.event.range.invalidate({ start, end }).catch(console.warn)
    },
    onError: (err, variables, context) => {
      if (context?.previousValue) {
        queryClient.event.range.setData({ start, end }, context.previousValue)
      }
    },
  })

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over?.id) return

    const [year, month, date] = e.over.id.toString().split('-')

    if (!year || !month || !date) return

    const yearInt = parseInt(year, 10)
    const monthInt = parseInt(month, 10)
    const dateInt = parseInt(date, 10)

    if (isNaN(yearInt) || isNaN(monthInt) || isNaN(dateInt)) return

    const events = queryClient.event.range.getData({ start, end })

    if (!events) return

    const event = events.find((event) => event.id === e.active.id)

    if (!event) return

    if (
      event.datetime.getFullYear() === yearInt &&
      event.datetime.getMonth() === monthInt - 1 &&
      event.datetime.getDate() === dateInt
    )
      return

    mutate({
      id: event.id,
      datetime: set(event.datetime, {
        year: yearInt,
        month: monthInt - 1, // 0 indexed
        date: dateInt,
      }),
    })
  }

  return (
    <>
      <div className="grid flex-grow grid-cols-2 gap-1">
        <DndContext onDragEnd={onDragEnd} sensors={[mouseSensor, touchSensor]}>
          <div className="grid grid-rows-2 gap-1">
            <DayOfWeek
              baseDate={start}
              dayOfWeek={6}
              events={events}
              periods={periods}
              loadingEvents={loading}
              outlines={outlines}
              weekStart={weekStart}
            />
            <DayOfWeek
              baseDate={start}
              dayOfWeek={0}
              events={events}
              periods={periods}
              loadingEvents={loading}
              outlines={outlines}
              weekStart={weekStart}
            />
          </div>
          <div className="grid grid-rows-5 gap-1">
            <DayOfWeek
              baseDate={start}
              dayOfWeek={5}
              events={events}
              periods={periods}
              loadingEvents={loading}
              outlines={outlines}
              weekStart={weekStart}
            />
            <DayOfWeek
              baseDate={start}
              dayOfWeek={4}
              events={events}
              periods={periods}
              loadingEvents={loading}
              outlines={outlines}
              weekStart={weekStart}
            />
            <DayOfWeek
              baseDate={start}
              dayOfWeek={3}
              events={events}
              periods={periods}
              loadingEvents={loading}
              outlines={outlines}
              weekStart={weekStart}
            />
            <DayOfWeek
              baseDate={start}
              dayOfWeek={2}
              events={events}
              periods={periods}
              loadingEvents={loading}
              outlines={outlines}
              weekStart={weekStart}
            />
            <DayOfWeek
              baseDate={start}
              dayOfWeek={1}
              events={events}
              periods={periods}
              loadingEvents={loading}
              outlines={outlines}
              weekStart={weekStart}
            />
          </div>
        </DndContext>
      </div>
      <EventModal />
    </>
  )
}
