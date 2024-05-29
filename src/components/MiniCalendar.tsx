import { endOfMonth, isSameDay, isSameMonth, set, startOfWeek } from 'date-fns'
import { useMemo } from 'react'
import { stdFormat } from './ui/dates/common'
import { cmerge, cn } from '~/utils/classnames'
import { weekDatesOfDateRange } from '~/utils/dates'
import { PathLink } from '~/utils/nav/Link'

type MiniCalendarProps = {
  focusDate: Date
  activeDate: Date
  showCurrent: boolean
}

export const MiniCalendar = ({
  focusDate,
  activeDate,
  showCurrent,
}: MiniCalendarProps) => {
  const weekDates = useMemo(() => {
    const startOfCurrMonth = set(new Date(), {
      date: 1,
      month: focusDate.getMonth(),
      year: focusDate.getFullYear(),
    })
    const endOfCurrMonth = endOfMonth(startOfCurrMonth)

    return weekDatesOfDateRange(startOfCurrMonth, endOfCurrMonth)
  }, [focusDate])

  return (
    <div className="flex flex-col gap-1">
      {weekDates.map((week, i) => (
        <PathLink
          key={i}
          path="/week"
          query={{ of: week[0] ? stdFormat(week[0]) : undefined }}
          className={cn(
            'grid grid-cols-7 rounded-full border bg-neutral-900',
            showCurrent &&
              week[0] &&
              isSameDay(startOfWeek(week[0]), startOfWeek(activeDate))
              ? 'border-neutral-500'
              : 'border-neutral-900 hover:bg-neutral-800'
          )}
        >
          {week.map((date, j) => (
            <div
              key={j}
              className={cmerge('flex-grow rounded-full py-1 text-center', {
                'text-neutral-500': !isSameMonth(date, focusDate),
                'bg-neutral-500 text-neutral-50': isSameDay(date, new Date()),
              })}
            >
              {date.getDate()}
            </div>
          ))}
        </PathLink>
      ))}
    </div>
  )
}
