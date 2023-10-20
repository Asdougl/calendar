import type { FC } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'
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
        <div
          className={cn(
            'bg-primary-400 hidden h-8 w-8 flex-shrink-0 flex-col items-center justify-center rounded-full text-white md:flex',
            event.category
              ? [getCategoryColor(event.category.color, 'bg'), 'text-sm']
              : 'bg-neutral-800'
          )}
        >
          {event.done !== null ? (
            <CheckIcon
              height={16}
              className={cn(
                'transition-transform',
                event.done ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
              )}
            />
          ) : event.category ? (
            event.category.icon
          ) : (
            event.title[0]
          )}
        </div>
        <div className="flex flex-col items-start">
          <span
            className={cn('text-left font-semibold leading-snug md:text-sm', {
              'line-through': inThePast,
            })}
          >
            {event.title}
          </span>
          <div className="flex items-center gap-2">
            {event.category && (
              <span
                className={cn(
                  'rounded-sm px-1 text-xs md:hidden',
                  getCategoryColor(event.category.color, 'bg')
                )}
              >
                {event.category.icon}
              </span>
            )}
            {event.time && (
              <span className="text-xs leading-tight text-neutral-500">
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
        </div>
      </li>
    </EventDialog>
  )
}
