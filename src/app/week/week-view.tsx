'use client'

import type { FC } from 'react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  addWeeks,
  endOfWeek,
  format,
  getDay,
  getWeek,
  setWeek,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { useSearchParams } from 'next/navigation'
import { useScroll, motion, useTransform } from 'framer-motion'
import { Header1 } from '~/components/ui/headers'
import { time, toCalendarDate } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'

type ViewOfAWeekProps = {
  starting: Date
  index: number
  onInView?: () => void
}

const ViewOfAWeek = forwardRef<HTMLDivElement, ViewOfAWeekProps>(
  function ViewOfAWeekWithRef({ starting, onInView }, ref) {
    const weekRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => weekRef.current!)

    const { data: events = [], isLoading } = api.event.range.useQuery(
      {
        start: toCalendarDate(starting),
        end: toCalendarDate(
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
            const dayOfWeek = getDay(new Date(event.date))
            const thisDay = eventsByDay[dayOfWeek]
            if (thisDay) thisDay?.push(event)
            else eventsByDay[dayOfWeek] = [event]
          })

          return eventsByDay
        },
      }
    )

    useLayoutEffect(() => {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      }

      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInView?.()
          }
        })
      }, options)

      if (weekRef.current) intersectionObserver.observe(weekRef.current)

      return () => {
        intersectionObserver.disconnect()
      }
    }, [onInView])

    return (
      <div
        ref={weekRef}
        className="flex h-full w-full flex-shrink-0 snap-center gap-2 overflow-hidden overflow-y-scroll px-1 pb-2"
      >
        {/* weekend */}
        <div className="relative flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={starting}
            dayOfWeek={6}
            events={events[6] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={0}
            events={events[0] || []}
            isLoading={isLoading}
          />
        </div>
        {/* weekdays */}
        <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={starting}
            dayOfWeek={5}
            events={events[5] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={4}
            events={events[4] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={3}
            events={events[3] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={2}
            events={events[2] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={1}
            events={events[1] || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    )
  }
)

const isThisWeek = (date: Date) => getWeek(date) === getWeek(new Date())

export const WeekView: FC = () => {
  const searchParams = useSearchParams()

  const startParam = searchParams.get('start')
  const startParamDate = startParam ? new Date(startParam) : new Date()

  const focusDate = setWeek(
    startOfWeek(startOfDay(startParamDate), {
      weekStartsOn: 1,
    }),
    getWeek(startParamDate)
  )

  const [loadedWeeks, setLoadedWeeks] = useState<[Date, Date, Date]>([
    subWeeks(focusDate, 1),
    focusDate,
    addWeeks(focusDate, 1),
  ])
  const weeksRefs = useRef<HTMLDivElement[]>([])

  const containerRef = useRef<HTMLDivElement>(null)

  // blocks intersectionObservers until the current week is in view
  const nextUpdate = useRef<(() => void) | null>(null)

  useEffect(() => {
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

  const thisWeekOpacity = useTransform(
    scrollXProgress,
    [0, 0.5, 1],
    isThisWeek(loadedWeeks[1])
      ? [0, 1, 0]
      : isThisWeek(loadedWeeks[0])
      ? [1, 0, 0]
      : isThisWeek(loadedWeeks[2])
      ? [0, 0, 1]
      : [0, 0, 0]
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

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="flex h-full w-8">
          <button
            className="group flex h-full w-full items-center justify-center rounded-lg hover:bg-neutral-800"
            disabled={!weeksRefs.current[0]}
            onClick={() =>
              weeksRefs.current[0]?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <ArrowLeftIcon
              height={20}
              className="translate-x-1 transition-transform group-hover:translate-x-0"
            />
          </button>
        </div>
        <Header1 className="relative flex h-8 items-baseline gap-2 text-2xl">
          Week of
          <div className="w-22 relative h-full overflow-hidden">
            <motion.div
              style={{ y: weektitleY }}
              className="flex flex-col gap-px"
            >
              <span>{format(loadedWeeks[0], 'MMM dd')}</span>
              <span>{format(loadedWeeks[1], 'MMM dd')}</span>
              <span>{format(loadedWeeks[2], 'MMM dd')}</span>
            </motion.div>
          </div>
          <motion.div
            style={{ opacity: thisWeekOpacity }}
            className="absolute left-full top-1/2 -translate-y-1/2 pl-1"
          >
            <div className="h-2 w-2 rounded-full bg-neutral-50"></div>
          </motion.div>
        </Header1>
        <div className="flex h-full w-8">
          <button
            className="group flex h-full w-full items-center justify-center rounded-lg hover:bg-neutral-800"
            disabled={!weeksRefs.current[2]}
            onClick={() =>
              weeksRefs.current[2]?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <ArrowRightIcon
              height={20}
              className="-translate-x-1 transition-transform group-hover:translate-x-0"
            />
          </button>
        </div>
      </header>
      <div
        ref={containerRef}
        className="flex h-full w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-scroll px-1"
        onScroll={onScroll}
      >
        <ViewOfAWeek
          key={format(loadedWeeks[0], 'yyyy-MM-dd')}
          ref={(ref) => {
            weeksRefs.current[0] = ref!
          }}
          starting={loadedWeeks[0]}
          index={0}
          onInView={() => {
            nextUpdate.current = () => {
              setLoadedWeeks((loadedWeeks) => [
                subWeeks(loadedWeeks[0], 1),
                loadedWeeks[0],
                loadedWeeks[1],
              ])
            }
          }}
        />
        <ViewOfAWeek
          key={format(loadedWeeks[1], 'yyyy-MM-dd')}
          ref={(ref) => {
            weeksRefs.current[1] = ref!
          }}
          starting={loadedWeeks[1]}
          index={1}
        />
        <ViewOfAWeek
          key={format(loadedWeeks[2], 'yyyy-MM-dd')}
          ref={(ref) => {
            weeksRefs.current[2] = ref!
          }}
          starting={loadedWeeks[2]}
          index={2}
          onInView={() => {
            nextUpdate.current = () => {
              setLoadedWeeks((loadedWeeks) => [
                loadedWeeks[1],
                loadedWeeks[2],
                addWeeks(loadedWeeks[2], 1),
              ])
            }
          }}
        />
      </div>
    </div>
  )
}
