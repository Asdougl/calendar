import { format, getDay, getDayOfYear, setDay, startOfDay } from 'date-fns'
import { type FC } from 'react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, getCategoryColor } from '~/utils/classnames'

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const DemoDayBox: FC<{
  focusDate: Date
  dayOfWeek: DayOfWeek
  eventsMap: Record<DayOfWeek, NonNullable<RouterOutputs['event']['range']>>
}> = ({ focusDate, dayOfWeek, eventsMap }) => {
  const day = startOfDay(
    setDay(focusDate, dayOfWeek, {
      weekStartsOn: getDay(new Date()),
    })
  )

  const distanceToToday = getDayOfYear(day) - getDayOfYear(new Date())
  return (
    <div
      className={cn(
        'flex-1 overflow-hidden rounded-lg border border-neutral-800 px-2 py-1',
        {
          'border-neutral-400': distanceToToday === 0,
          'border-neutral-500': distanceToToday === 1,
          'border-neutral-600': distanceToToday === 2,
        }
      )}
    >
      <div className="flex justify-between">
        <div
          className={cn('flex items-baseline gap-1', {
            'opacity-40': distanceToToday === 6,
            'opacity-60': distanceToToday === 5,
            'opacity-80': distanceToToday === 4,
          })}
        >
          <div className="font-bold">{format(day, 'E')}</div>
          <div className="text-sm">{format(day, 'd MMM')}</div>
        </div>
      </div>
      <ul className="flex flex-col gap-1 overflow-scroll py-1">
        {eventsMap[dayOfWeek].map((event) => (
          <li
            key={event.id}
            className={cn(
              'flex items-center justify-start overflow-hidden rounded-lg px-1 md:flex-row md:items-center md:gap-1',
              { 'opacity-50': event.datetime.getTime() < new Date().getTime() }
            )}
          >
            <div className="flex items-start justify-start gap-1 overflow-hidden md:gap-2">
              <div
                className={cn(
                  'mt-1 h-3 w-1 flex-shrink-0 rounded-full',
                  getCategoryColor(event.category?.color, 'bg')
                )}
              ></div>
              <div
                className={cn(
                  'flex-grow-0 truncate text-left text-sm leading-snug',
                  {
                    'line-through':
                      event.datetime.getTime() < new Date().getTime(),
                  }
                )}
              >
                {event.title}
              </div>
            </div>
            {event.timeStatus === 'STANDARD' && (
              <div
                className={cn(
                  'whitespace-nowrap text-xs leading-tight text-neutral-500 md:pl-2'
                )}
              >
                {format(event.datetime, 'HH:mm')}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
