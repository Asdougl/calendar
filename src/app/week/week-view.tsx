'use client'

import type { FC } from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  getDay,
  getWeek,
  setWeek,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Header1 } from '~/components/ui/headers'
import { time, toCalendarDate } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { DayBoxSkeleton } from '~/components/skeleton/DayBox'
import { cn } from '~/utils/classnames'

export const WeekView: FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const queryClient = api.useContext()

  const startParam = searchParams.get('start')

  const focusDate = setWeek(
    startOfWeek(startOfDay(new Date()), {
      weekStartsOn: 1,
    }),
    getWeek(startParam ? new Date(startParam) : new Date())
  )

  useEffect(() => {
    router.prefetch(
      `/week?start=${format(subWeeks(focusDate, 1), 'yyyy-MM-dd')}`
    )
    router.prefetch(
      `/week?start=${format(addWeeks(focusDate, 1), 'yyyy-MM-dd')}`
    )
  }, [router, focusDate, pathname])

  const { data: events, isLoading } = api.event.range.useQuery(
    {
      start: toCalendarDate(focusDate),
      end: toCalendarDate(
        endOfWeek(focusDate, {
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

  const nextWeek = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    const newStart = addWeeks(focusDate, 1)
    const newStartEnd = endOfWeek(newStart, {
      weekStartsOn: 1,
    })

    queryClient.event.range
      .prefetch(
        {
          start: toCalendarDate(newStart),
          end: toCalendarDate(newStartEnd),
        },
        {
          staleTime: time.minutes(2),
        }
      )
      .catch(console.error)

    params.set('start', format(addWeeks(focusDate, 1), 'yyyy-MM-dd'))
    router.push(`${pathname}?${params.toString()}`)
  }, [focusDate, pathname, router, searchParams, queryClient])

  const prevWeek = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    const newStart = subWeeks(focusDate, 1)
    const newStartEnd = endOfWeek(newStart, {
      weekStartsOn: 1,
    })
    queryClient.event.range
      .prefetch(
        {
          start: toCalendarDate(newStart),
          end: toCalendarDate(newStartEnd),
        },
        {
          staleTime: time.minutes(2),
        }
      )
      .catch(console.error)
    params.set('start', format(subWeeks(focusDate, 1), 'yyyy-MM-dd'))
    router.push(`${pathname}?${params.toString()}`)
  }, [focusDate, pathname, router, searchParams, queryClient])

  const prevWeekDiv = useRef<HTMLDivElement>(null)
  const focusWeekDiv = useRef<HTMLDivElement>(null)
  const nextWeekDiv = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (focusWeekDiv.current) {
      focusWeekDiv.current.scrollIntoView()
    }

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    }

    const prevObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prevWeek()
        }
      })
    }, options)

    const nextObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          nextWeek()
        }
      })
    }, options)

    if (prevWeekDiv.current) prevObserver.observe(prevWeekDiv.current)
    if (nextWeekDiv.current) nextObserver.observe(nextWeekDiv.current)

    return () => {
      prevObserver.disconnect()
      nextObserver.disconnect()
    }
  }, [focusDate, nextWeek, prevWeek])

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8">
          <button onClick={prevWeek}>
            <ArrowLeftIcon height={20} />
          </button>
        </div>
        <Header1 className="text-2xl">
          Week of {format(focusDate, 'MMM d')}
        </Header1>
        <div className="w-8">
          <button onClick={nextWeek}>
            <ArrowRightIcon height={20} />
          </button>
        </div>
      </header>
      <div
        className={cn(
          'flex h-full w-screen snap-x snap-mandatory flex-nowrap overflow-scroll px-1',
          isLoading && 'overflow-hidden'
        )}
      >
        <div
          ref={prevWeekDiv}
          className="grid h-full max-h-screen w-screen max-w-2xl flex-shrink-0 snap-center grid-cols-2 gap-2 px-1 pb-2"
        >
          {/* weekend */}
          <div className="grid grid-rows-2 gap-2">
            <DayBoxSkeleton date={subDays(focusDate, 2)} />
            <DayBoxSkeleton date={subDays(focusDate, 1)} />
          </div>
          {/* weekdays */}
          <div className="grid grid-rows-5 gap-2">
            <DayBoxSkeleton date={subDays(focusDate, 3)} />
            <DayBoxSkeleton date={subDays(focusDate, 4)} />
            <DayBoxSkeleton date={subDays(focusDate, 5)} />
            <DayBoxSkeleton date={subDays(focusDate, 6)} />
            <DayBoxSkeleton date={subDays(focusDate, 7)} />
          </div>
        </div>
        <div
          ref={focusWeekDiv}
          className="grid h-full w-screen max-w-2xl flex-shrink-0 snap-center grid-cols-2 gap-2 overflow-y-scroll px-1 pb-2"
        >
          {/* weekend */}
          <div className="grid grid-rows-2 gap-2">
            <DayBox
              focusDate={focusDate}
              dayOfWeek={6}
              events={eventsByDay[6] || []}
              isLoading={isLoading}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={0}
              events={eventsByDay[0] || []}
              isLoading={isLoading}
            />
          </div>
          {/* weekdays */}
          <div className="grid grid-rows-5 gap-2">
            <DayBox
              focusDate={focusDate}
              dayOfWeek={5}
              events={eventsByDay[5] || []}
              isLoading={isLoading}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={4}
              events={eventsByDay[4] || []}
              isLoading={isLoading}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={3}
              events={eventsByDay[3] || []}
              isLoading={isLoading}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={2}
              events={eventsByDay[2] || []}
              isLoading={isLoading}
            />
            <DayBox
              focusDate={focusDate}
              dayOfWeek={1}
              events={eventsByDay[1] || []}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div
          ref={nextWeekDiv}
          className="grid h-full max-h-screen w-screen max-w-2xl flex-shrink-0 snap-center grid-cols-2 gap-2 px-1 pb-2"
        >
          {/* weekend */}
          <div className="grid grid-rows-2 gap-2">
            <DayBoxSkeleton date={addDays(focusDate, 12)} />
            <DayBoxSkeleton date={addDays(focusDate, 13)} />
          </div>
          {/* weekdays */}
          <div className="grid grid-rows-5 gap-2">
            <DayBoxSkeleton date={addDays(focusDate, 11)} />
            <DayBoxSkeleton date={addDays(focusDate, 10)} />
            <DayBoxSkeleton date={addDays(focusDate, 9)} />
            <DayBoxSkeleton date={addDays(focusDate, 8)} />
            <DayBoxSkeleton date={addDays(focusDate, 7)} />
          </div>
        </div>
      </div>
    </div>
  )
}
