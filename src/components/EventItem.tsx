import type { FC } from 'react'
import { format } from 'date-fns'
import { ViewEvent } from './ViewEvent'
import { cn, getCategoryColor } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'

export const EventItem: FC<{
  event: NonNullable<RouterOutputs['event']['range']>[number]
  startOpen?: boolean
}> = ({ event, startOpen }) => {
  const inThePast = event.datetime.getTime() < new Date().getTime()

  return (
    <li className="w-full">
      <ViewEvent event={event} initialOpen={startOpen}>
        <button
          className={cn(
            'flex w-full items-stretch gap-1 overflow-hidden rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-neutral-600 md:flex-row md:items-center md:gap-1 lg:gap-2 lg:px-2 lg:hover:bg-neutral-900',
            { 'opacity-50': inThePast }
          )}
        >
          <div
            className={cn(
              'w-1 flex-shrink-0 rounded-full text-xs',
              getCategoryColor(event.category?.color, 'bg')
            )}
          >
            &nbsp;
          </div>
          <div className="overflow-hidden">
            <div
              className={cn(
                'flex-grow-0 truncate text-left text-sm leading-snug lg:text-base',
                {
                  'line-through': inThePast,
                }
              )}
            >
              {event.title}
            </div>
            {event.timeStatus === 'STANDARD' && (
              <div className="whitespace-nowrap text-left text-xs leading-tight text-neutral-500">
                {format(event.datetime, 'h:mm a')}
              </div>
            )}
          </div>
        </button>
      </ViewEvent>
    </li>
  )
}
