import type { FC } from 'react'
import { EventDialog } from './EventDialog'
import type { EventWithCategory } from '@/types/supabase'
import { cn, getCategoryColor } from '@/util/classnames'

const hasMeaningfulTime = (date: Date) => {
  return date.getHours() > 0 || date.getMinutes() > 0 || date.getSeconds() > 0
}

export const EventItem: FC<{ event: EventWithCategory }> = ({ event }) => {
  const eventDateTime = new Date(event.datetime)

  const inThePast = eventDateTime < new Date()

  return (
    <EventDialog event={event}>
      <li
        className={cn(
          'flex items-center gap-2 hover:bg-neutral-900 rounded-lg p-1',
          { 'opacity-50': inThePast }
        )}
      >
        <div
          className={cn(
            'md:flex flex-col flex-shrink-0 items-center justify-center w-8 h-8 rounded-full bg-primary-400 text-white hidden',
            event.category
              ? [getCategoryColor(event.category.color, 'bg'), 'text-sm']
              : 'bg-neutral-800'
          )}
        >
          {event.category ? event.category.icon : event.title[0]}
        </div>
        <div className="flex flex-col items-start">
          <span
            className={cn('font-semibold text-left md:text-sm leading-snug', {
              'line-through': inThePast,
            })}
          >
            {event.title}
          </span>
          <div className="flex gap-2 items-center">
            {event.category && (
              <span
                className={cn(
                  'text-xs md:hidden px-1 rounded-sm',
                  getCategoryColor(event.category.color, 'bg')
                )}
              >
                {event.category.icon}
              </span>
            )}
            {hasMeaningfulTime(eventDateTime) && (
              <span className="text-xs text-neutral-500 leading-tight">
                {new Date(event.datetime).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </li>
    </EventDialog>
  )
}
