'use client'

import type { FC } from 'react'
import { ViewEvent } from './ViewEvent'
import { cn, getCategoryColor } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'
import { timeFormat } from '~/utils/dates'
import { usePreferences } from '~/trpc/hooks'

export const EventItem: FC<{
  event: NonNullable<RouterOutputs['event']['range']>[number]
  startOpen?: boolean
  count?: number
  isWeekend?: boolean
}> = ({ event, startOpen, count, isWeekend }) => {
  const inThePast = event.datetime.getTime() < new Date().getTime()

  const { preferences } = usePreferences()

  return (
    <li
      className={cn('w-full px-1', {
        // if is not weekend and count > 3 then hide when in the past but only on mobile
        'hidden md:block':
          isWeekend === false && count && count > 3 && inThePast,
      })}
    >
      <ViewEvent event={event} initialOpen={startOpen}>
        <button
          className={cn(
            'flex w-full items-stretch gap-0.5 overflow-hidden rounded focus:outline-none focus:ring-2 focus:ring-neutral-600 lg:gap-2 lg:hover:bg-neutral-900',
            { 'opacity-50': inThePast }
          )}
        >
          <div
            className={cn(
              'block w-1 flex-shrink-0 rounded-full text-xs',
              getCategoryColor(event.category?.color, 'bg')
            )}
          >
            &nbsp;
          </div>
          <div className="flex w-full flex-row items-center justify-between gap-2 overflow-hidden">
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
              <div className="whitespace-nowrap text-left text-xs leading-tight text-neutral-500 lg:-mt-1">
                {timeFormat(event.datetime, preferences)}
              </div>
            )}
          </div>
        </button>
      </ViewEvent>
    </li>
  )
}
