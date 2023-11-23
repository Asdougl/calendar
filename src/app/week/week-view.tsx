'use client'

import type { FC } from 'react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  addDays,
  addWeeks,
  endOfDay,
  endOfWeek,
  format,
  getDay,
  getWeek,
  isSameDay,
  isSameWeek,
  setWeek,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { useSearchParams } from 'next/navigation'
import { useScroll, motion, useTransform, useInView } from 'framer-motion'
import { Header1 } from '~/components/ui/headers'
import { time } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { cn } from '~/utils/classnames'
import { type Preferences } from '~/types/preferences'
import { InnerPageLayout } from '~/components/layout/PageLayout'

type ViewOfAWeekProps = {
  starting: Date
  index: number
  onInView?: () => void
  preferences: Preferences
}

const ViewOfAWeek = forwardRef<HTMLDivElement, ViewOfAWeekProps>(
  function ViewOfAWeekWithRef({ starting, onInView, preferences }, ref) {
    const weekRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => weekRef.current!)

    const { data: periods = [] } = api.periods.range.useQuery(
      {
        start: startOfDay(starting),
        end: endOfDay(
          endOfWeek(starting, {
            weekStartsOn: 1,
          })
        ),
      },
      {
        select: (data) => {
          if (!data?.length) return []

          const periodsByDay: (typeof data)[] = []

          const daysOfFocus: Date[] = []
          for (let i = 0; i < 7; i++) {
            daysOfFocus.push(addDays(startOfDay(starting), i))
          }

          data.forEach((period) => {
            daysOfFocus.forEach((day) => {
              if (
                isSameDay(period.startDate, day) ||
                isSameDay(period.endDate, day) ||
                (period.startDate <= day && period.endDate >= day)
              ) {
                const thisDay = periodsByDay[getDay(day)]
                if (thisDay) thisDay?.push(period)
                else periodsByDay[getDay(day)] = [period]
              }
            })
          })

          return periodsByDay
        },
      }
    )

    const { data: events = [], isLoading } = api.event.range.useQuery(
      {
        start: startOfDay(starting),
        end: endOfDay(
          endOfWeek(starting, {
            weekStartsOn: 1,
          })
        ),
      },
      {
        refetchOnWindowFocus: false,
        staleTime: time.minutes(2),
        refetchInterval: time.minutes(5),
        select: (data) => {
          if (!data?.length) return []

          const eventsByDay: NonNullable<typeof data>[] = []

          data.forEach((event) => {
            const dayOfWeek = getDay(event.datetime)
            const thisDay = eventsByDay[dayOfWeek]
            if (thisDay) thisDay?.push(event)
            else eventsByDay[dayOfWeek] = [event]
          })

          return eventsByDay
        },
      }
    )

    const isInView = useInView(weekRef)

    useEffect(() => {
      if (isInView && onInView) onInView()
    }, [isInView, onInView])

    return (
      <div
        ref={weekRef}
        className={cn(
          'flex h-full w-full flex-shrink-0 snap-center gap-2 overflow-hidden overflow-y-scroll px-1 pb-2',
          {
            'flex-row-reverse': !preferences.leftWeekends,
          }
        )}
      >
        {/* weekend */}
        <div className="relative flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={starting}
            dayOfWeek={6}
            events={events[6] || []}
            isLoading={isLoading}
            periods={periods[6]}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={0}
            events={events[0] || []}
            isLoading={isLoading}
            periods={periods[0]}
          />
        </div>
        {/* weekdays */}
        <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={starting}
            dayOfWeek={5}
            events={events[5] || []}
            isLoading={isLoading}
            periods={periods[5]}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={4}
            events={events[4] || []}
            isLoading={isLoading}
            periods={periods[4]}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={3}
            events={events[3] || []}
            isLoading={isLoading}
            periods={periods[3]}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={2}
            events={events[2] || []}
            isLoading={isLoading}
            periods={periods[2]}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={1}
            events={events[1] || []}
            isLoading={isLoading}
            periods={periods[1]}
          />
        </div>
      </div>
    )
  }
)

export const WeekView: FC<{ preferences: Preferences }> = ({ preferences }) => {
  const searchParams = useSearchParams()

  const [focusDate, setFocusDate] = useState<Date>(() => {
    const startParam = searchParams.get('start')
    const startParamDate = startParam ? new Date(startParam) : new Date()

    return setWeek(
      startOfWeek(startOfDay(startParamDate), {
        weekStartsOn: 1,
      }),
      getWeek(startParamDate)
    )
  })
  const [loadedWeeks, setLoadedWeeks] = useState<[string, string, string]>([
    format(subWeeks(focusDate, 1), 'yyyy-MM-dd'),
    format(focusDate, 'yyyy-MM-dd'),
    format(addWeeks(focusDate, 1), 'yyyy-MM-dd'),
  ])
  const weeksRefs = useRef<HTMLDivElement[]>([])

  const containerRef = useRef<HTMLDivElement>(null)

  // blocks intersectionObservers until the current week is in view
  const nextUpdate = useRef<(() => void) | null>(null)

  useEffect(() => {
    nextUpdate.current = null
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth / 3
    }
  }, [loadedWeeks])

  const { scrollXProgress } = useScroll({
    container: containerRef,
  })

  const weektitleY = useTransform(
    scrollXProgress,
    [0, 0.5, 1],
    [0, (1 / 3) * -100, (2 / 3) * -100]
  )

  const onScrollTimeout = useRef<ReturnType<typeof setTimeout>>()

  const onScroll = () => {
    if (onScrollTimeout.current) clearTimeout(onScrollTimeout.current)
    onScrollTimeout.current = setTimeout(() => {
      if (nextUpdate.current) {
        nextUpdate.current()
        nextUpdate.current = null
      }
    }, 300)
  }

  const viewNextWeek = () => {
    setLoadedWeeks([
      format(focusDate, 'yyyy-MM-dd'),
      format(addWeeks(focusDate, 1), 'yyyy-MM-dd'),
      format(addWeeks(focusDate, 2), 'yyyy-MM-dd'),
    ])
    setFocusDate(addWeeks(focusDate, 1))
  }

  const viewPrevWeek = () => {
    setLoadedWeeks([
      format(subWeeks(focusDate, 2), 'yyyy-MM-dd'),
      format(subWeeks(focusDate, 1), 'yyyy-MM-dd'),
      format(focusDate, 'yyyy-MM-dd'),
    ])
    setFocusDate(subWeeks(focusDate, 1))
  }

  return (
    <InnerPageLayout
      headerLeft={
        <button
          className="group flex h-full w-full items-center justify-center rounded-lg hover:bg-neutral-800"
          disabled={!weeksRefs.current[0]}
          onClick={() => viewPrevWeek()}
        >
          <ArrowLeftIcon
            height={20}
            className="translate-x-1 transition-transform group-hover:translate-x-0"
          />
        </button>
      }
      title={
        <Header1 className="relative flex h-8 items-baseline gap-2 text-2xl">
          Week of
          <div className="w-22 relative h-full overflow-hidden">
            <motion.div
              style={{ y: weektitleY }}
              className="flex origin-top flex-col gap-px"
            >
              {loadedWeeks.map((week) => (
                <span
                  key={week}
                  className={cn(
                    'text-neutral-200',
                    isSameWeek(new Date(week), new Date()) && 'underline'
                  )}
                >
                  {format(new Date(week), 'MMM dd')}
                </span>
              ))}
            </motion.div>
          </div>
        </Header1>
      }
      headerRight={
        <button
          className="group flex h-full w-full items-center justify-center rounded-lg hover:bg-neutral-800"
          disabled={!weeksRefs.current[2]}
          onClick={() => viewNextWeek()}
        >
          <ArrowRightIcon
            height={20}
            className="-translate-x-1 transition-transform group-hover:translate-x-0"
          />
        </button>
      }
    >
      <div
        ref={containerRef}
        className="flex h-full w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-scroll"
        onScroll={onScroll}
      >
        {loadedWeeks.map((week, i) => (
          <ViewOfAWeek
            key={week}
            ref={(ref) => (weeksRefs.current[i] = ref!)}
            starting={startOfDay(new Date(week))}
            index={i}
            preferences={preferences}
            onInView={() => {
              nextUpdate.current = () => {
                if (i === 0) {
                  viewPrevWeek()
                } else if (i === 2) {
                  viewNextWeek()
                }
              }
            }}
          />
        ))}
      </div>
    </InnerPageLayout>
  )
}
