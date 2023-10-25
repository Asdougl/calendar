'use client'

import type { FC } from 'react'
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
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
import { Header1 } from '~/components/ui/headers'
import { time, toCalendarDate } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { useMountEffect } from '~/utils/hooks'

type ViewOfAWeekProps = {
  starting: Date
  ready: boolean
  index: number
  onInView?: () => void
}

const ViewOfAWeek = forwardRef<HTMLDivElement, ViewOfAWeekProps>(
  function ViewOfAWeekWithRef({ starting, ready, index, onInView }, ref) {
    const weekRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => weekRef.current!)

    const { data: events, isLoading } = api.event.range.useQuery(
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
      }
    )

    const eventsByDay = useMemo(() => {
      if (!events?.length) return []

      const eventsByDay: NonNullable<RouterOutputs['event']['range']>[] = []

      events.forEach((event) => {
        const dayOfWeek = getDay(new Date(event.date))
        const thisDay = eventsByDay[dayOfWeek]
        if (thisDay) thisDay?.push(event)
        else eventsByDay[dayOfWeek] = [event]
      })

      return eventsByDay
    }, [events])

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

      if (ready && weekRef.current)
        intersectionObserver.observe(weekRef.current)

      return () => {
        intersectionObserver.disconnect()
      }
    }, [onInView, ready])

    return (
      <div
        ref={weekRef}
        className="grid h-full w-full flex-shrink-0 snap-center grid-cols-2 gap-2 overflow-y-scroll px-1 pb-2"
      >
        {/* weekend */}
        <div className="grid grid-rows-3 gap-2">
          {index}
          <DayBox
            focusDate={starting}
            dayOfWeek={6}
            events={eventsByDay[6] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={0}
            events={eventsByDay[0] || []}
            isLoading={isLoading}
          />
        </div>
        {/* weekdays */}
        <div className="grid grid-rows-5 gap-2">
          <DayBox
            focusDate={starting}
            dayOfWeek={5}
            events={eventsByDay[5] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={4}
            events={eventsByDay[4] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={3}
            events={eventsByDay[3] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={2}
            events={eventsByDay[2] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={starting}
            dayOfWeek={1}
            events={eventsByDay[1] || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    )
  }
)

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

  // blocks intersectionObservers until the current week is in view
  const [ready, setReady] = useState(false)
  const blocker = useRef<ReturnType<typeof setTimeout>>()

  useMountEffect(() => {
    const currentWeek = weeksRefs.current[1]
    if (currentWeek) {
      currentWeek.scrollIntoView()
      setReady(true)
    }
  })

  const onScrollTimeout = useRef<ReturnType<typeof setTimeout>>()

  const onScroll = () => {
    if (onScrollTimeout.current) clearTimeout(onScrollTimeout.current)
    if (ready) setReady(false)
    onScrollTimeout.current = setTimeout(() => {
      setReady(true)
    }, 100)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8">
          <button
            className="hidden md:block"
            disabled={!ready || !weeksRefs.current[0]}
            onClick={() =>
              weeksRefs.current[0]?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <ArrowLeftIcon height={20} />
          </button>
        </div>
        <Header1 className="text-2xl">
          Week of {format(loadedWeeks[1], 'MMM d')}
        </Header1>
        <div className="w-8">
          <button
            className="hidden md:block"
            disabled={!ready || !weeksRefs.current[2]}
            onClick={() =>
              weeksRefs.current[2]?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <ArrowRightIcon height={20} />
          </button>
        </div>
      </header>
      <div
        className="flex h-full w-full snap-x snap-mandatory flex-nowrap overflow-scroll px-1"
        onScroll={onScroll}
      >
        <ViewOfAWeek
          key={format(loadedWeeks[0], 'yyyy-MM-dd')}
          ref={(ref) => {
            weeksRefs.current[0] = ref!
          }}
          starting={loadedWeeks[0]}
          ready={ready}
          index={0}
          onInView={() => {
            if (!blocker.current) {
              setLoadedWeeks((loadedWeeks) => [
                subWeeks(loadedWeeks[0], 1),
                loadedWeeks[0],
                loadedWeeks[1],
              ])
              blocker.current = setTimeout(() => {
                blocker.current = undefined
              }, 200)
            }
          }}
        />
        <ViewOfAWeek
          key={format(loadedWeeks[1], 'yyyy-MM-dd')}
          ref={(ref) => {
            weeksRefs.current[1] = ref!
          }}
          starting={loadedWeeks[1]}
          ready={ready}
          index={1}
        />
        <ViewOfAWeek
          key={format(loadedWeeks[2], 'yyyy-MM-dd')}
          ref={(ref) => {
            weeksRefs.current[2] = ref!
          }}
          starting={loadedWeeks[2]}
          ready={ready}
          index={2}
          onInView={() => {
            if (!blocker.current) {
              setLoadedWeeks((loadedWeeks) => [
                loadedWeeks[1],
                loadedWeeks[2],
                addWeeks(loadedWeeks[2], 1),
              ])
              blocker.current = setTimeout(() => {
                blocker.current = undefined
              }, 200)
            }
          }}
        />
      </div>
    </div>
  )
}
