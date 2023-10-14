import { format, getDay, getDayOfYear, setDay, startOfDay } from 'date-fns'
import type { FC } from 'react'
import { useMemo } from 'react'
import { EventDialog } from './EventDialog'
import { EventItem } from './EventItem'
import { cn } from '@/util/classnames'
import type { EventWithCategory } from '@/types/supabase'

export const DayBox: FC<{
  focusDate: Date
  dayOfWeek: number
  events: EventWithCategory[]
  isLoading: boolean
  startToday?: boolean
}> = ({ focusDate, dayOfWeek, events, isLoading, startToday }) => {
  const day = useMemo(() => {
    return startOfDay(
      setDay(focusDate, dayOfWeek, {
        weekStartsOn: startToday ? getDay(new Date()) : 1,
      })
    )
  }, [focusDate, dayOfWeek, startToday])

  const distanceToToday = getDayOfYear(day) - getDayOfYear(new Date())

  return (
    <div
      className={cn(
        'border flex-grow rounded-lg px-2 py-1 border-neutral-800',
        { 'border-neutral-400': distanceToToday === 0 },
        startToday && {
          'border-neutral-500': distanceToToday === 1,
          'border-neutral-600': distanceToToday === 2,
        }
      )}
    >
      <div className="flex justify-between">
        <div
          className={cn(
            'flex gap-1 items-baseline',
            startToday
              ? {
                  'opacity-40': distanceToToday === 6,
                  'opacity-60': distanceToToday === 5,
                  'opacity-80': distanceToToday === 4,
                }
              : {
                  'opacity-60': distanceToToday < 0,
                }
          )}
        >
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
