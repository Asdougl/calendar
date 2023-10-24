import type { FC } from 'react'
import { getUnixTime } from 'date-fns'
import { EventDialog } from './EventDialog'
import { cn, getCategoryColor } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'
import { dateFromDateAndTime } from '~/utils/dates'

export const EventItem: FC<{
  event: NonNullable<RouterOutputs['event']['range']>[number]
}> = ({ event }) => {
  const inThePast = event.timestamp < getUnixTime(new Date())

  return (
    <EventDialog event={event}>
      <li
        className={cn(
          'flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-900',
          { 'opacity-50': inThePast }
        )}
      >
        <div className="flex flex-col flex-wrap items-baseline justify-start md:flex-row">
          <div className="flex items-start justify-start gap-1 md:gap-2">
            {event.category && (
              <div
                className={cn(
                  'mt-[7px] h-2 w-2 rounded-full',
                  getCategoryColor(event.category.color, 'bg')
                )}
              ></div>
            )}
            <span
              className={cn('text-left font-semibold leading-snug', {
                'line-through': inThePast,
              })}
            >
              {event.title}
            </span>
          </div>
          {event.time && (
            <span className="-mt-[2px] whitespace-nowrap pl-3 text-xs leading-tight text-neutral-500 md:pl-2">
              {dateFromDateAndTime(event.date, event.time).toLocaleTimeString(
                [],
                {
                  hour: 'numeric',
                  minute: 'numeric',
                }
              )}
            </span>
          )}
        </div>
      </li>
    </EventDialog>
  )
}
