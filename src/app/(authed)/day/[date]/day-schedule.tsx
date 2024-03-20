'use client'

import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  MouseSensor,
  TouchSensor,
  useDndContext,
  pointerWithin,
} from '@dnd-kit/core'
import {
  addDays,
  endOfDay,
  format,
  isBefore,
  isSameDay,
  setHours,
  startOfDay,
} from 'date-fns'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { type TIME_INVERVAL, type TimeStatus } from '@prisma/client'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Loader } from '~/components/ui/Loader'
import { Header1, Header2 } from '~/components/ui/headers'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { Duration, daysAway } from '~/utils/dates'
import { useQueryParams } from '~/utils/nav/hooks'
import { warn } from '~/utils/logging'
import { SEARCH_PARAM_NEW, modifyCurrentSearchParams } from '~/utils/nav/search'
import { stdFormat } from '~/components/ui/dates/common'
import { PathLink } from '~/utils/nav/Link'
import { useMountEffect } from '~/utils/hooks'
import { type DayOfWeek } from '~/types/preferences'
import { Avatar } from '~/components/ui/avatar'

const FIVE_MINUTE_HEIGHT = 6 //px
const HOUR_HEIGHT = 12 * FIVE_MINUTE_HEIGHT //px
const FULL_HEIGHT = 24 * HOUR_HEIGHT //px

// FYI -- in pipelines this outputs in all caps
const timeFormatter = new Intl.DateTimeFormat('en', {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
})

const eventItemTime = (event: RouterOutputs['event']['range'][number]) => {
  if (event.timeStatus === 'ALL_DAY') return 'All Day'
  if (event.timeStatus === 'NO_TIME') return ''
  return timeFormatter.format(event.datetime)
}

type EventableItem = {
  category: {
    id: string
    name: string
    color: string
  } | null
  recursion: {
    id: string
    interval: TIME_INVERVAL
    intervalCount: number
    triggered: boolean
  } | null
  id: string
  done: boolean | null
  title: string
  datetime: Date
  timeStatus: TimeStatus
  location: string | null
  cancelled: boolean
  endDateTime: Date | null
  createdBy?: {
    id: string
    name: string | null
    image: string | null
  } | null
}

const DayScheduleItem = ({
  event,
  unplanned = false,
  getScroll,
}: {
  event: EventableItem
  unplanned?: boolean
  getScroll: () => number
}) => {
  const session = useSession()

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: {
        status: event.timeStatus,
        time: format(event.datetime, 'HH:mm'),
      },
      disabled: event.createdBy
        ? event.createdBy.id !== session.data?.user?.id
        : false,
    })

  const [, setQueryParams] = useQueryParams()

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${
          unplanned ? transform.y - getScroll() : transform.y
        }px, 0)`,
      }
    : undefined

  const navigate = () => {
    setQueryParams({
      update: {
        event: event.id,
      },
      remove: ['period'],
    })
  }
  return (
    <button
      onClick={navigate}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        'pointer-events-auto flex w-full items-stretch gap-1 rounded border border-neutral-800 bg-neutral-950 pr-2 text-sm ring-blue-500 focus:outline-none focus:ring lg:hover:bg-neutral-800',
        { 'pointer-events-none z-10': isDragging },
        { 'mx-10': unplanned && isDragging }
      )}
    >
      {event.createdBy ? (
        <div className="flex items-center pr-px lg:pr-1">
          <Avatar
            size="xs"
            src={event.createdBy.image}
            name={event.createdBy.name || 'User'}
          />
        </div>
      ) : event.done !== null ? (
        <div
          className={cn(
            'flex w-5 flex-shrink-0 items-center justify-center rounded border-2',
            color('border')(event.category?.color)
          )}
        >
          {event.done && <CheckIcon height={14} />}
        </div>
      ) : (
        <div
          className={cn(
            'w-1 flex-shrink-0 rounded-full',
            color('bg')(event.category?.color)
          )}
        ></div>
      )}
      <div className="flex grow flex-wrap items-center justify-between gap-x-2 overflow-hidden">
        <div className="truncate whitespace-nowrap">{event.title}</div>
        <div className="text-xs text-neutral-400">{eventItemTime(event)}</div>
      </div>
    </button>
  )
}

const UnscheduledDropZone = ({
  status,
  text,
}: {
  status: TimeStatus
  text: string
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn('flex items-center justify-center', {
        'bg-neutral-800': isOver,
      })}
    >
      {text}
    </div>
  )
}

const UnscheduledZone = ({
  events,
  getScroll,
  dateStr,
}: {
  events: RouterOutputs['event']['range']
  getScroll: () => number
  dateStr: string
}) => {
  const { active } = useDndContext()

  return (
    <div className="relative flex flex-col gap-2 border-b border-b-neutral-800 px-2 py-2">
      {events.map((event) => (
        <DayScheduleItem
          key={event.id}
          event={event}
          unplanned
          getScroll={getScroll}
        />
      ))}
      <Link
        href={modifyCurrentSearchParams({
          update: {
            event: SEARCH_PARAM_NEW,
            date: dateStr,
          },
          remove: ['period'],
        })}
        className="rounded-lg text-center text-sm text-neutral-400 lg:hover:bg-neutral-900 lg:hover:text-neutral-50"
      >
        Add Event
      </Link>
      <div
        className={cn(
          'absolute left-0 top-0 grid h-full w-full grid-cols-2 divide-x divide-dashed divide-neutral-800 border border-dashed border-neutral-800 bg-neutral-950/90',
          { hidden: !active }
        )}
      >
        <UnscheduledDropZone status="NO_TIME" text="Unscheduled" />
        <UnscheduledDropZone status="ALL_DAY" text="All Day" />
      </div>
    </div>
  )
}

const HOURS_OF_THE_DAY = Array.from({ length: 24 }, (_, i) => i)

const HourOfDay = ({ hour, date }: { hour: number; date: Date }) => {
  const [isInPast, setIsInPast] = useState(false)

  const { data: preferences } = api.preferences.getAll.useQuery()

  const { setNodeRef: setStartNodeRef, isOver: isOverStart } = useDroppable({
    id: `${hour.toString().padStart(2, '0')}:00`,
  })

  const { setNodeRef: setHalfNodeRef, isOver: isOverHalf } = useDroppable({
    id: `${hour.toString().padStart(2, '0')}:30`,
  })

  const isWorkHour =
    preferences?.workDays.includes(
      format(date, 'EEE').toLowerCase() as DayOfWeek
    ) &&
    hour >= preferences?.workHours.start &&
    hour < preferences?.workHours.end

  useEffect(() => {
    setIsInPast(isBefore(setHours(date, hour + 1), new Date()))
  }, [date, hour])

  return (
    <div
      style={{ height: `${HOUR_HEIGHT}px` }}
      className={cn(
        'flex shrink-0 border-b border-neutral-800 last:border-b-0',
        { 'opacity-50': isInPast }
      )}
    >
      <div className="flex w-16 items-start justify-end border-r border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-400">
        {hour > 11
          ? `${hour > 12 ? hour - 12 : hour} pm`
          : hour === 0
          ? '12 am'
          : `${hour} am`}
      </div>
      <div className={cn('grow', { 'bg-neutral-900': isWorkHour })}>
        {!isInPast ? (
          <>
            <Link
              href={modifyCurrentSearchParams({
                update: {
                  event: SEARCH_PARAM_NEW,
                  date: stdFormat(date),
                  time: `${hour}:00`,
                },
                remove: ['period'],
              })}
              ref={setStartNodeRef}
              className={cn(
                'block h-1/2 border-b border-neutral-800 lg:hover:bg-neutral-800',
                {
                  'bg-neutral-600': isOverStart,
                }
              )}
            />
            <Link
              href={modifyCurrentSearchParams({
                update: {
                  event: SEARCH_PARAM_NEW,
                  date: stdFormat(date),
                  time: `${hour}:30`,
                },
                remove: ['period'],
              })}
              ref={setHalfNodeRef}
              className={cn('block h-1/2 lg:hover:bg-neutral-800', {
                'bg-neutral-600': isOverHalf,
              })}
            />
          </>
        ) : (
          <>
            <div
              ref={setStartNodeRef}
              className={cn('block h-1/2 border-b border-neutral-800', {
                'bg-neutral-600': isOverStart,
              })}
            />
            <div
              ref={setHalfNodeRef}
              className={cn('block h-1/2', {
                'bg-neutral-600': isOverHalf,
              })}
            />
          </>
        )}
      </div>
    </div>
  )
}

const createSlots = (eventCount: number) =>
  Array.from({ length: 48 }, () => Array.from({ length: eventCount }, () => ''))

const buildScheduleSlots = (events: RouterOutputs['event']['range']) => {
  // build our array, y axis is slots (30 mins), y axis is events
  const slotArray = createSlots(events.length)

  const slottedEvents: Record<number, typeof events> = {}

  let highestSlot = 0

  // Fill out the slots with events
  events.forEach((event) => {
    // get the starting timeslot and ending timeslot, given slot as the index of the 30 minute block it occupies within the day
    const startSlot =
      event.datetime.getHours() * 2 +
      Math.floor(event.datetime.getMinutes() / 30)

    const endSlot = event.endDateTime
      ? event.endDateTime.getHours() * 2 +
        Math.floor(event.endDateTime.getMinutes() / 30)
      : event.datetime.getHours() * 2 +
        Math.floor((event.datetime.getMinutes() + 15) / 30)

    for (let i = 0; i < events.length; i++) {
      let slotOk = false
      for (let j = startSlot; j < endSlot + 1; j++) {
        const timeslot = slotArray[j]
        if (!timeslot?.[i]) {
          slotOk = true
        } else {
          slotOk = false
          break
        }
      }

      if (slotOk) {
        for (let j = startSlot; j < endSlot + 1; j++) {
          const timeslot = slotArray[j]
          if (timeslot) timeslot[i] = event.id
        }
        const eventSlot = slottedEvents[i]
        if (eventSlot) {
          eventSlot.push({ ...event })
        } else {
          slottedEvents[i] = [{ ...event }]
        }
        break
      }

      if (i > highestSlot) highestSlot = i
    }
  })

  return {
    slots: highestSlot,
    events: slottedEvents,
  }
}

const NowIndicator = () => {
  const [, reRender] = useState(0)

  const nowRef = useRef<HTMLDivElement>(null)

  useMountEffect(() => {
    nowRef.current?.scrollIntoView()
  })

  useEffect(() => {
    const interval = setInterval(() => {
      reRender((prev) => prev + 1)
    }, Duration.seconds(60))
    return () => clearInterval(interval)
  }, [])

  const now = new Date()

  return (
    <div
      ref={nowRef}
      className="pointer-events-none absolute left-0 z-10 w-full pl-16"
      style={{
        top: `${
          ((now.getTime() - startOfDay(now).getTime()) / 86400000) * FULL_HEIGHT
        }px`,
      }}
    >
      <div className="h-0.5 w-full bg-blue-500"></div>
      <div className="absolute bottom-0 left-16 text-xs text-blue-500">
        {format(now, 'h:mm a')}
      </div>
    </div>
  )
}

const eventsSelector = (data: RouterOutputs['event']['range']) => {
  const allDay: typeof data = []
  const noTime: typeof data = []
  const timed: typeof data = []

  data.forEach((event) => {
    if (event.timeStatus === 'ALL_DAY') {
      allDay.push(event)
    } else if (event.timeStatus === 'NO_TIME') {
      noTime.push(event)
    } else {
      timed.push(event)
    }
  })

  return { allDay, noTime, timed: buildScheduleSlots(timed) }
}

const useDateEvents = (
  queryParams: { start: Date; end: Date },
  shared: boolean
) => {
  const sharedEvents = api.event.sharedRange.useQuery(queryParams, {
    select: eventsSelector,
    enabled: shared,
  })
  const unsharedEvents = api.event.range.useQuery(queryParams, {
    select: eventsSelector,
    enabled: !shared,
  })

  return shared ? sharedEvents : unsharedEvents
}

export const DaySchedule = ({
  date,
  from,
}: {
  date: string
  from?: string
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

  const containerRef = useRef<HTMLDivElement>(null)

  const [searchParams] = useQueryParams()

  const queryParams = useMemo(
    () => ({
      start: startOfDay(new Date(date)),
      end: endOfDay(new Date(date)),
    }),
    [date]
  )

  const inXDays = daysAway(queryParams.start)

  const queryClient = api.useUtils()

  const events = useDateEvents(queryParams, from === 'shared')

  const updateEvent = api.event.update.useMutation({
    onMutate: (input) => {
      const previous = queryClient.event.range.getData(queryParams)

      if (!previous) return

      queryClient.event.range.setData(queryParams, (old) => {
        if (!old) return
        return old.map((event) => {
          if (event.id === input.id) {
            return {
              ...event,
              ...input,
            }
          }
          return event
        })
      })

      return { previous }
    },
    onSettled: () => {
      queryClient.event.invalidate().catch(warn)
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.event.range.setData(queryParams, context.previous)
      }
    },
  })

  const onDragEnd = (dragEvent: DragEndEvent) => {
    const droppedAt = dragEvent.over?.id.toString()
    const eventId = dragEvent.active.id
    if (!droppedAt) return

    if (/\d\d:\d\d/.test(droppedAt)) {
      if (
        dragEvent.active.data?.current &&
        'time' in dragEvent.active.data.current &&
        dragEvent.active.data?.current.time === droppedAt
      )
        return

      updateEvent.mutate({
        id: eventId.toString(),
        datetime: new Date(
          `${format(queryParams.start, 'yyyy-MM-dd')}T${droppedAt}:00`
        ),
        timeStatus: 'STANDARD',
      })
    } else if (droppedAt === 'NO_TIME' || droppedAt === 'ALL_DAY') {
      if (
        dragEvent.active.data?.current &&
        'status' in dragEvent.active.data.current &&
        dragEvent.active.data?.current.status === droppedAt
      )
        return

      updateEvent.mutate({
        id: eventId.toString(),
        datetime: new Date(
          `${format(queryParams.start, 'yyyy-MM-dd')}T12:00:00`
        ),
        timeStatus: droppedAt,
      })
    }
  }

  const now = new Date()
  const isToday = isSameDay(queryParams.start, now)

  let backLink: ReactNode
  if (from === 'shared') {
    backLink = (
      <PathLink path="/shared" className="flex items-center justify-center">
        <ArrowLeftIcon height={20} className="" />
      </PathLink>
    )
  } else if (from === 'week' && searchParams.get('fromWeek')) {
    backLink = (
      <PathLink
        path="/week"
        query={{ of: searchParams.get('fromWeek') }}
        className="flex items-center justify-center"
      >
        <ArrowLeftIcon height={20} className="" />
      </PathLink>
    )
  } else {
    backLink = (
      <PathLink path="/inbox" className="flex items-center justify-center">
        <ArrowLeftIcon height={20} className="" />
      </PathLink>
    )
  }

  return (
    <InnerPageLayout
      headerLeft={backLink}
      title={
        <div className="flex flex-col items-center">
          <Header2 className="text-base font-normal text-neutral-500">
            {format(queryParams.start, 'EEEE')}
          </Header2>
          <Header1 className="relative flex h-8 items-baseline gap-2 text-2xl">
            {format(queryParams.start, 'do MMM yyyy')}
          </Header1>
          <Header2 className="text-base font-normal text-neutral-500">
            {inXDays}
          </Header2>
        </div>
      }
      headerRight={
        !events.isLoading ? (
          <div className="flex gap-2">
            <PathLink
              path="/day/:date"
              params={{ date: stdFormat(addDays(queryParams.start, -1)) }}
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon height={20} className="" />
              <span className="sr-only">Previous Day</span>
            </PathLink>
            <PathLink
              path="/day/:date"
              params={{ date: stdFormat(addDays(queryParams.start, 1)) }}
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon height={20} className="rotate-180" />
              <span className="sr-only">Next Day</span>
            </PathLink>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex items-center justify-center opacity-50">
              <ChevronLeftIcon height={20} className="" />
            </div>
            <div className="flex items-center justify-center opacity-50">
              <ChevronLeftIcon height={20} className="rotate-180" />
            </div>
          </div>
        )
      }
    >
      {events.isLoading ? (
        <div className="relative z-0 flex grow flex-col overflow-hidden rounded-lg border border-neutral-800">
          <div className="relative flex flex-col items-center justify-center gap-2 border-b border-b-neutral-800 px-2 py-2">
            <Loader />
          </div>
          <div className="relative flex grow flex-col overflow-hidden opacity-50">
            {HOURS_OF_THE_DAY.map((hour) => (
              <HourOfDay hour={hour} key={hour} date={queryParams.start} />
            ))}
          </div>
        </div>
      ) : (
        <DndContext
          onDragEnd={onDragEnd}
          // modifiers={[restrictToVerticalAxis]}
          collisionDetection={pointerWithin}
          sensors={[mouseSensor, touchSensor]}
        >
          <div className="relative z-0 flex grow flex-col overflow-hidden rounded-lg border border-neutral-800">
            {/* All day + Untimed Events */}
            <UnscheduledZone
              dateStr={stdFormat(queryParams.start)}
              events={
                events.data
                  ? [...events.data.allDay, ...events.data.noTime]
                  : []
              }
              getScroll={() => containerRef.current?.scrollTop ?? 0}
            />
            <div
              className="relative flex grow flex-col overflow-y-auto overflow-x-hidden"
              ref={containerRef}
            >
              {/* TOTAL HEIGHT 1536px (64px * 24hrs) */}
              {HOURS_OF_THE_DAY.map((hour) => (
                <HourOfDay hour={hour} key={hour} date={queryParams.start} />
              ))}
              {events.data ? (
                <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full pl-16 pr-4">
                  {Object.values(events.data.timed.events).map((events, i) => (
                    <div key={i} className="relative flex flex-1 flex-col">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="absolute w-full"
                          style={{
                            top: `${
                              ((event.datetime.getTime() -
                                queryParams.start.getTime()) /
                                86400000) *
                              FULL_HEIGHT
                            }px`,
                            left: '0',
                            right: '0',
                          }}
                        >
                          <DayScheduleItem
                            event={event}
                            getScroll={() =>
                              containerRef.current?.scrollTop ?? 0
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
              {isToday && <NowIndicator />}
            </div>
          </div>
        </DndContext>
      )}
    </InnerPageLayout>
  )
}
