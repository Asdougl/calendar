import type { FC } from 'react'
import { format } from 'date-fns'
import { EventDialog } from './EventDialog'
import { cn, getCategoryColor } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'

export const EventItem: FC<{
  event: NonNullable<RouterOutputs['event']['range']>[number]
  condensed?: boolean
  origin?: string
}> = ({ event, condensed, origin }) => {
  const inThePast = event.datetime.getTime() < new Date().getTime()

  return (
    <EventDialog event={event} origin={origin}>
      <li
        className={cn(
          'flex items-center justify-start overflow-hidden rounded-lg px-1 hover:bg-neutral-900 md:flex-row md:items-center md:gap-1',
          { 'opacity-50': inThePast },
          !condensed ? 'flex-col items-start' : 'flex-row items-center gap-1'
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
                'line-through': inThePast,
              }
            )}
          >
            {event.title}
          </div>
        </div>
        {event.timeStatus === 'STANDARD' && (
          <div
            className={cn(
              'whitespace-nowrap text-xs leading-tight text-neutral-500 md:pl-2',
              !condensed && 'pl-2 md:pl-0'
            )}
          >
            {format(event.datetime, 'HH:mm')}
          </div>
        )}
      </li>
    </EventDialog>
  )
}
