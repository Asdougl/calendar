import { usePreferences } from '~/trpc/hooks'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { isEventComplete, timeFormat } from '~/utils/dates'

export const MonthItem = ({
  event,
  loading,
}: {
  event: RouterOutputs['event']['range'][number]
  loading: boolean
}) => {
  const { preferences } = usePreferences()

  return (
    <div
      className={cn(
        'relative flex flex-col gap-0.5 pl-1 hover:bg-neutral-900',
        {
          'animate-pulse opacity-50': loading,
        }
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-0.5 rounded-lg',
          color('bg')(event.category?.color)
        )}
      ></div>
      <div
        className={cn('truncate whitespace-nowrap text-xs', {
          'text-neutral-500 line-through': isEventComplete(event),
        })}
      >
        {event.title}
      </div>
      {event.timeStatus === 'STANDARD' && (
        <div className="-mt-1 hidden text-xs opacity-50 md:block">
          {timeFormat(event.datetime, preferences)}
        </div>
      )}
    </div>
  )
}
