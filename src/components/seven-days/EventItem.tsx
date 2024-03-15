import { useDraggable } from '@dnd-kit/core'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useQueryParams } from '~/utils/nav/hooks'
import { cn, color } from '~/utils/classnames'
import { type RouterOutputs } from '~/trpc/shared'
import { isEventComplete } from '~/utils/dates'

const timeFormatter = new Intl.DateTimeFormat('default', {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
})

const eventItemTime = (event: RouterOutputs['event']['range'][number]) => {
  if (event.timeStatus === 'ALL_DAY') return 'All Day'
  if (event.timeStatus === 'NO_TIME') return ''
  return timeFormatter.format(event.datetime)
}

export const EventItem = ({
  event,
}: {
  event: RouterOutputs['event']['range'][number]
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
    })

  const [, setQueryParams] = useQueryParams()

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const navigate = () => {
    setQueryParams({
      update: {
        event: event.id,
      },
      remove: ['period'],
    })
  }

  return (
    <button
      onClick={navigate}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        'flex flex-shrink-0 items-center justify-between rounded bg-neutral-950 text-sm lg:text-base lg:hover:bg-neutral-900',
        { 'pointer-events-none z-10': isDragging }
      )}
    >
      <div className="flex min-w-0 items-center gap-0.5 xl:gap-1">
        {event.done === null ? (
          <div
            className={cn(
              'h-4 w-0.5 flex-shrink-0 rounded-full xl:w-1',
              color('bg')(event.category?.color)
            )}
          ></div>
        ) : (
          <div
            className={cn(
              'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 pr-0.5',
              color('border')(event.category?.color)
            )}
          >
            {event.done && <CheckIcon height={12} />}
          </div>
        )}
        <span
          className={cn('truncate', {
            'text-neutral-500 line-through': isEventComplete(event),
          })}
        >
          {event.title}
        </span>
      </div>
      <div className="whitespace-nowrap text-sm text-neutral-500 xl:pr-2">
        {eventItemTime(event)}
      </div>
    </button>
  )
}
