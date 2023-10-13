'use client'

import type { FC } from 'react'
import { useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery } from '@tanstack/react-query'
import { format, getDay, getDayOfYear, setDay, startOfDay } from 'date-fns'
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid'
import { cn } from '@/util/classnames'
import type { Database } from '@/types/typegen'
import { Header1 } from '@/components/headers'
import { time } from '@/util/dates'
import { EventDialog } from '@/components/EventDialog'
import { EventItem } from '@/components/EventItem'
import type { EventWithCategory } from '@/types/supabase'
import { EventWithCategoryQuery } from '@/types/supabase'
import { Debugger } from '@/components/Debugger'

const DayBox: FC<{
  focusDate: Date
  dayOfWeek: number
  events: EventWithCategory[]
  isLoading: boolean
}> = ({ focusDate, dayOfWeek, events, isLoading }) => {
  const day = useMemo(() => {
    const todayDay = getDay(new Date())

    return startOfDay(
      setDay(focusDate, dayOfWeek, {
        weekStartsOn: todayDay,
      })
    )
  }, [focusDate, dayOfWeek])

  const distanceToToday = getDayOfYear(day) - getDayOfYear(new Date())

  return (
    <div
      className={cn(
        'border flex-grow rounded-lg px-2 py-1 border-neutral-800',
        {
          'border-neutral-400': distanceToToday === 0,
          'border-neutral-500': distanceToToday === 1,
          'border-neutral-600': distanceToToday === 2,
        }
      )}
    >
      <div className="flex justify-between">
        <div className="flex gap-1 items-baseline">
          <div className="font-bold">{format(day, 'E')}</div>
          <div className="text-sm">{format(day, 'd MMM')}</div>
        </div>
        <EventDialog initialDate={day} />
      </div>
      <ul className="py-1 flex flex-col gap-1">
        {isLoading ? (
          <li className="rounded-full w-3/4 bg-neutral-900 my-2 animate-pulse h-4"></li>
        ) : (
          events.map((event) => <EventItem key={event.id} event={event} />)
        )}
      </ul>
    </div>
  )
}

export const WeekView: FC = () => {
  const supabase = createClientComponentClient<Database>()

  const focusDate = startOfDay(new Date())

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', '7-days'],
    queryFn: async () => {
      const { data } = await supabase
        .from(EventWithCategoryQuery.from)
        .select(EventWithCategoryQuery.select)
        .gte('datetime', focusDate.toISOString())
        .lt(
          'datetime',
          setDay(focusDate, 7, {
            weekStartsOn: getDay(focusDate),
          }).toISOString()
        )
      return data || []
    },
    refetchOnWindowFocus: false,
    staleTime: time.minutes(5),
    refetchInterval: time.minutes(10),
  })

  const eventsByDay = useMemo(() => {
    if (!events?.length) return []

    const eventsByDay: EventWithCategory[][] = []

    events.forEach((event) => {
      const dayOfWeek = getDay(new Date(event.datetime))
      if (!eventsByDay[dayOfWeek]) eventsByDay[dayOfWeek] = [event]
      else eventsByDay[dayOfWeek].push(event)
    })

    return eventsByDay
  }, [events])

  return (
    <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8">
          <Debugger />
        </div>
        <Header1 className="text-2xl">Inbox</Header1>
        <div className="w-8">
          <button>
            <EllipsisVerticalIcon height={20} />
          </button>
        </div>
      </header>
      <div className="grid grid-cols-2 max-h-screen h-full gap-2 px-1 pb-2">
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
    </div>
  )
}
