'use client'

import { differenceInCalendarDays, set, setDay } from 'date-fns'
import { type FC } from 'react'
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
import { useRouter } from 'next/navigation'
import { PathLink } from './ui/PathLink'
import { stdFormat } from './ui/dates/common'
import { type RouterInputs, type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { eventSort } from '~/utils/sort'
import { api } from '~/trpc/react'
import {
  SEARCH_PARAMS_NEW,
  createUpdatedSearchParams,
} from '~/utils/searchParams'
import { warn } from '~/utils/logging'

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

  const router = useRouter()

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const now = new Date()

  const navigate = () => {
    router.push(eventLink(event.id))
  }

  return (
    <button
      onClick={navigate}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        'flex flex-shrink-0 items-center justify-between rounded bg-neutral-950 text-sm lg:text-base lg:hover:bg-neutral-900',
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
            'text-neutral-500 line-through':
              event.timeStatus === 'STANDARD' && event.datetime < now,
          })}
        >
          {event.title}
        </span>
      </div>
      <div className="whitespace-nowrap text-sm text-neutral-500">
        {eventItemTime(event)}
      </div>
    </button>
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

const eventLink = (id: string, date?: Date) => {
  return createUpdatedSearchParams({
    update: {
      event: id,
      date: date ? stdFormat(date) : undefined,
    },
    remove: ['period'],
  })
}

const periodLink = (id: string, date?: Date) => {
  return createUpdatedSearchParams({
    update: {
      period: id,
      date: date ? stdFormat(date) : undefined,
    },
    remove: ['event'],
  })
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
        <div className="flex items-center gap-2 px-1 pt-1">
          {periodsForDay.map((period) => (
            <Link
              key={period.id}
              href={periodLink(period.id)}
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-sm text-xs',
                color('bg')(period.color)
              )}
            >
              {period.icon}
            </Link>
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
                href={eventLink(SEARCH_PARAMS_NEW, date)}
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

export type SevenDaysShellProps = SevenDaysProps & {
  findEvent: (id: string) => RouterOutputs['event']['range'][number] | undefined
  updateEvent: (input: RouterInputs['event']['update']) => void
}

export const SevenDaysShell: FC<SevenDaysShellProps> = ({
  start,
  events,
  periods,
  loading,
  outlines,
  weekStart,
  findEvent,
  updateEvent,
}) => {
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

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over?.id) return

    const [year, month, date] = e.over.id.toString().split('-')

    if (!year || !month || !date) return

    const yearInt = parseInt(year, 10)
    const monthInt = parseInt(month, 10)
    const dateInt = parseInt(date, 10)

    if (isNaN(yearInt) || isNaN(monthInt) || isNaN(dateInt)) return

    const event = findEvent(e.active.id.toString())

    if (!event) return

    if (
      event.datetime.getFullYear() === yearInt &&
      event.datetime.getMonth() === monthInt - 1 &&
      event.datetime.getDate() === dateInt
    )
      return

    updateEvent({
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
    </>
  )
}

export const SevenDays = (props: SevenDaysProps) => {
  const queryClient = api.useUtils()

  const { mutate } = api.event.update.useMutation({
    onMutate: (data) => {
      if (data.datetime) {
        const curr = queryClient.event.range.getData(props)

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

              queryClient.event.range.setData(props, copy)
            }
          }
        }

        return { previousValue: curr }
      }
    },
    onSuccess: () => {
      queryClient.event.range.invalidate(props).catch(warn)
    },
    onError: (err, variables, context) => {
      if (context?.previousValue) {
        queryClient.event.range.setData(props, context.previousValue)
      }
    },
  })

  const findEvent = (id: string) => {
    const events = queryClient.event.range.getData(props)

    if (!events) return

    return events.find((event) => event.id === id)
  }

  return (
    <SevenDaysShell {...props} findEvent={findEvent} updateEvent={mutate} />
  )
}
