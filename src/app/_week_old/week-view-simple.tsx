'use client'

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/solid'
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
import { useInView, useScroll, useTransform, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FC, useEffect, useRef, useState, useMemo } from 'react'
import debounce from 'lodash/debounce'
import { DayBox } from '~/components/DayBox'
import { PageLayout } from '~/components/layout/PageLayout'
import { Header1 } from '~/components/ui/headers'
import { usePreferences } from '~/trpc/hooks'
import { api } from '~/trpc/react'
import { useOrigination } from '~/utils/atoms'
import { cn } from '~/utils/classnames'
import { time } from '~/utils/dates'

type ChangeWeekIndicatorProps = {
  onInView: () => void
  locked: boolean
  dir: 'left' | 'right'
}

const ChangeWeekIndicator: FC<ChangeWeekIndicatorProps> = ({
  onInView,
  locked,
  dir,
}) => {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const halfWayRef = useRef<HTMLDivElement>(null)

  const enqueuedFn = useRef<(() => void) | null>(null)

  const totallyInView = useInView(indicatorRef, { amount: 'all' })
  const halfInView = useInView(halfWayRef, { amount: 'some' })

  useEffect(() => {
    if (totallyInView) {
      // Totally in view, enqueue
      enqueuedFn.current = onInView
    }

    if (!totallyInView && !halfInView) {
      // Not in view, execute!
      if (enqueuedFn.current && !locked) {
        enqueuedFn.current()
        enqueuedFn.current = null
      }
    }
  }, [totallyInView, halfInView, locked, onInView])

  return (
    <div
      ref={indicatorRef}
      className="relative flex w-1/3 flex-shrink-0 flex-col items-center justify-center"
    >
      <ArrowLeftIcon
        height={30}
        className={dir === 'right' ? 'rotate-180' : 'rotate-0'}
      />
      <div
        ref={halfWayRef}
        className={cn(
          'absolute top-0 h-full w-1/2 bg-transparent',
          dir === 'right' ? 'right-0' : 'left-0'
        )}
      ></div>
    </div>
  )
}

const getFocusDate = (startParam: string | null) => {
  const startParamDate = startParam ? new Date(startParam) : new Date()

  return setWeek(
    startOfWeek(startOfDay(startParamDate), {
      weekStartsOn: 1,
    }),
    getWeek(startParamDate)
  )
}

export const WeekViewSimple = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const { preferences } = usePreferences()

  const startParam = searchParams.get('start')

  const [focusDate, setFocusDate] = useState<Date>(() => {
    return getFocusDate(startParam)
  })

  useEffect(() => {
    const newFocusDate = getFocusDate(startParam)
    if (!isSameDay(newFocusDate, focusDate)) {
      setFocusDate(newFocusDate)
    }
  }, [startParam, focusDate])

  const originString = `week-${format(focusDate, 'yyyy-MM-dd')}`

  const [, setOriginating] = useOrigination()

  useEffect(() => {
    setOriginating(originString)
  }, [originString, setOriginating])

  const { data: periods = [] } = api.periods.range.useQuery(
    {
      start: startOfDay(focusDate),
      end: endOfDay(
        endOfWeek(focusDate, {
          weekStartsOn: 1,
        })
      ),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: time.minutes(2),
      refetchInterval: time.minutes(5),
      select: (data) => {
        if (!data?.length) return []

        const periodsByDay: (typeof data)[] = []

        const daysOfFocus: Date[] = []
        for (let i = 0; i < 7; i++) {
          daysOfFocus.push(addDays(startOfDay(focusDate), i))
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

  const {
    data: events = [],
    isLoading,
    isFetching,
  } = api.event.range.useQuery(
    {
      start: startOfDay(focusDate),
      end: endOfDay(
        endOfWeek(focusDate, {
          weekStartsOn: 1,
        })
      ),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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

  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollXProgress } = useScroll({
    container: containerRef,
  })

  const weektitleY = useTransform(
    scrollXProgress,
    [0, 0.5, 1],
    [0, (1 / 3) * -100, (2 / 3) * -100]
  )

  const viewNextWeek = useMemo(() => {
    return debounce(() => {
      router.push('/week?start=' + format(addWeeks(focusDate, 1), 'yyyy-MM-dd'))
    }, 100)
  }, [focusDate, router])

  const viewPrevWeek = useMemo(() => {
    return debounce(() => {
      router.push('/week?start=' + format(subWeeks(focusDate, 1), 'yyyy-MM-dd'))
    }, 100)
  }, [focusDate, router])

  const fullLoading = isLoading

  const now = new Date()
  const nextWeek = addWeeks(focusDate, 1)
  const prevWeek = subWeeks(focusDate, 1)

  return (
    <PageLayout
      headerLeft={
        <button
          className="group flex w-full items-center justify-center rounded-lg hover:bg-neutral-800"
          onClick={viewPrevWeek}
        >
          <ArrowLeftIcon
            height={20}
            className="translate-x-1 transition-transform group-hover:translate-x-0"
          />
        </button>
      }
      title={
        <div className="relative">
          <div
            className={cn(
              'absolute left-1/2 top-0 -z-10 -translate-x-1/2 rounded-full bg-neutral-950 p-1 shadow-lg transition-transform delay-200',
              isFetching ? 'translate-y-8' : 'translate-y-0'
            )}
          >
            {isFetching ? (
              <ArrowPathIcon height={20} className="animate-spin" />
            ) : (
              <CheckIcon height={20} />
            )}
          </div>
          <Header1 className="relative flex h-8 items-baseline gap-2 bg-neutral-950 text-2xl">
            Week of
            <div className="w-22 relative h-full overflow-hidden">
              <motion.div
                style={{ y: weektitleY }}
                className="flex origin-top flex-col gap-px"
              >
                <span
                  className={cn(
                    'text-neutral-200',
                    isSameWeek(prevWeek, now, { weekStartsOn: 1 }) &&
                      'underline'
                  )}
                >
                  {format(prevWeek, 'MMM dd')}
                </span>
                <span
                  className={cn(
                    'text-neutral-200',
                    isSameWeek(focusDate, now, { weekStartsOn: 1 }) &&
                      'underline'
                  )}
                >
                  {format(focusDate, 'MMM dd')}
                </span>
                <span
                  className={cn(
                    'text-neutral-200',
                    isSameWeek(nextWeek, now, { weekStartsOn: 1 }) &&
                      'underline'
                  )}
                >
                  {format(nextWeek, 'MMM dd')}
                </span>
              </motion.div>
            </div>
          </Header1>
        </div>
      }
      headerRight={
        <button
          className="group flex h-full w-full items-center justify-center rounded-lg hover:bg-neutral-800"
          onClick={viewNextWeek}
        >
          <ArrowRightIcon
            height={20}
            className="-translate-x-1 transition-transform group-hover:translate-x-0"
          />
        </button>
      }
      fullscreen
    >
      <div
        ref={containerRef}
        className={cn(
          'flex h-full w-full flex-grow snap-x snap-mandatory flex-nowrap items-stretch gap-2 overflow-y-hidden overflow-x-scroll',
          { isLoading: 'overflow-x-hidden' }
        )}
        // onScroll={onScroll}
      >
        <ChangeWeekIndicator
          onInView={viewPrevWeek}
          locked={isLoading}
          dir="left"
        />
        <div
          className={cn(
            'flex w-full flex-shrink-0 snap-center gap-2 overflow-hidden overflow-y-scroll px-1 pb-2',
            {
              'flex-row-reverse': preferences?.weekends === 'right',
            }
          )}
        >
          {/* weekend */}
          <div className="relative flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
            <DayBox
              focusDate={focusDate}
              dayOfWeek={6}
              events={events[6] || []}
              isLoading={fullLoading}
              periods={periods[6]}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={0}
              events={events[0] || []}
              isLoading={fullLoading}
              periods={periods[0]}
            />
          </div>
          {/* weekdays */}
          <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
            <DayBox
              focusDate={focusDate}
              dayOfWeek={5}
              events={events[5] || []}
              isLoading={fullLoading}
              periods={periods[5]}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={4}
              events={events[4] || []}
              isLoading={fullLoading}
              periods={periods[4]}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={3}
              events={events[3] || []}
              isLoading={fullLoading}
              periods={periods[3]}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={2}
              events={events[2] || []}
              isLoading={fullLoading}
              periods={periods[2]}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={1}
              events={events[1] || []}
              isLoading={fullLoading}
              periods={periods[1]}
            />
          </div>
        </div>
        <ChangeWeekIndicator
          onInView={viewNextWeek}
          locked={isLoading}
          dir="right"
        />
      </div>
    </PageLayout>
  )
}
