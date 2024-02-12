import {
  getDate,
  getMonth,
  getYear,
  isSameDay,
  setDate,
  format,
  addMonths,
  isBefore,
  isAfter,
} from 'date-fns'
import { type FC, useMemo, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { Button } from '../button'
import {
  accessibleFormat,
  daysOfWeek,
  displayFormat,
  isDisabled,
  stdFormat,
} from './common'
import { getMonthDates } from '~/utils/dates'
import { cn } from '~/utils/classnames'
import { useViewport } from '~/utils/hooks'
import { BREAKPOINTS } from '~/utils/constants'

type DateRangePickerProps = {
  start?: Date
  end?: Date
  onChange: (value: { start: Date | undefined; end: Date | undefined }) => void
  min?: Date
  max?: Date
  className?: string
  id?: string
}

type PickDateButtonProps = {
  date: Date
  start: Date | undefined
  end: Date | undefined
  isCurrent: (date: Date) => boolean
  onSelect: (date: Date) => void
  min?: Date
  max?: Date
}

const PickDateButton: FC<PickDateButtonProps> = ({
  date,
  start,
  end,
  isCurrent,
  onSelect,
  min,
  max,
}) => {
  const viewport = useViewport()

  const isStart = start ? isSameDay(date, start) : false
  const isEnd = end ? isSameDay(date, end) : false

  const isInRange = useMemo(() => {
    if (!start || !end) return false
    return isSameDay(date, start) || isSameDay(date, end)
      ? true
      : isAfter(date, start) && isBefore(date, end)
  }, [date, start, end])

  const selected = isStart || isEnd
  const current = isCurrent(date)
  const isToday = isSameDay(date, new Date())

  let ariaLabel = accessibleFormat(date)
  if (isToday) ariaLabel += ', today'
  if (current) ariaLabel += ', selected date'

  return (
    <button
      // ref={isToday ? todayRef : undefined}
      type="button"
      disabled={
        isDisabled(date, min, max) ||
        (viewport.width >= BREAKPOINTS.lg && !current)
      }
      aria-label={ariaLabel}
      className={cn(
        'h-10 w-auto border text-lg text-neutral-50 hover:bg-neutral-900 md:w-10',
        current
          ? 'disabled:opacity-10'
          : 'text-opacity-20 lg:text-opacity-100 lg:opacity-0',
        {
          'rounded-lg': isStart && isEnd,
          'rounded-r': isEnd,
          'rounded-l': isStart,
          'border-neutral-500 bg-neutral-500 text-neutral-50 text-opacity-100':
            selected,
          'font-bold underline': isToday,
          'border-transparent': !selected,
          'bg-neutral-900': !isStart && !isEnd && isInRange,
        }
      )}
      onClick={() => onSelect(date)}
    >
      {getDate(date)}
    </button>
  )
}

export const DateRangePicker: FC<DateRangePickerProps> = ({
  start,
  end,
  onChange,
  min,
  max,
  className,
  id,
}) => {
  const [focusMonth, setFocusMonth] = useState(() => {
    return setDate(start ?? new Date(), 1)
  })
  const [open, setOpen] = useState(false)

  const [{ monthOneDates, monthTwoDates }, setMonthDates] = useState<{
    monthOneDates: Date[][]
    monthTwoDates: Date[][]
  }>(() => {
    return {
      monthOneDates: getMonthDates(getYear(focusMonth), getMonth(focusMonth)),
      monthTwoDates: getMonthDates(
        getYear(focusMonth),
        getMonth(focusMonth) + 1
      ),
    }
  })

  const change = (chosen: Date) => {
    if (start && end) {
      if (chosen < start) {
        onChange({ start: chosen, end })
      } else if (chosen > end) {
        onChange({ start, end: chosen })
      } else {
        onChange({ start, end: chosen })
      }
    } else if (start) {
      if (chosen < start) {
        onChange({ start: chosen, end: start })
      } else if (isSameDay(chosen, start)) {
        onChange({ start: undefined, end: undefined })
      } else {
        onChange({ start, end: chosen })
      }
    } else {
      onChange({ start: chosen, end: chosen })
    }
  }

  const nextMonth = () => {
    const newMonth = addMonths(focusMonth, 1)
    const newNextMonth = addMonths(newMonth, 1)
    setFocusMonth(newMonth)
    setMonthDates({
      monthOneDates: getMonthDates(getYear(newMonth), getMonth(newMonth)),
      monthTwoDates: getMonthDates(
        getYear(newNextMonth),
        getMonth(newNextMonth)
      ),
    })
  }

  const prevMonth = () => {
    const newMonth = addMonths(focusMonth, -1)
    const newNextMonth = addMonths(newMonth, 1)
    setFocusMonth(newMonth)
    setMonthDates({
      monthOneDates: getMonthDates(getYear(newMonth), getMonth(newMonth)),
      monthTwoDates: getMonthDates(
        getYear(newNextMonth),
        getMonth(newNextMonth)
      ),
    })
  }

  const isFocusMonth = (date: Date) => {
    return getMonth(date) === getMonth(focusMonth)
  }

  const isFocusNextMonth = (date: Date) => {
    return getMonth(date) === getMonth(addMonths(focusMonth, 1))
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button id={id} className={cn('flex items-center gap-2', className)}>
          <CalendarIcon height={20} />
          {start && end ? (
            <>
              <span>{displayFormat(start)}</span>
              <span>to</span>
              <span>{displayFormat(end)}</span>
            </>
          ) : (
            <span>Select Dates</span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="relative z-10 w-screen p-2 md:w-auto"
          aria-label="date picker"
        >
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="flex h-10 items-center justify-between">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="h-full rounded-lg px-2 hover:bg-neutral-900"
                    aria-label="Previous Month"
                  >
                    <ChevronLeftIcon height={18} />
                  </button>
                  <div>{format(focusMonth, 'MMMM yyyy')}</div>
                  <div className="hidden opacity-0 lg:block">
                    <ChevronRightIcon height={18} />
                  </div>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="h-full rounded-lg px-2 hover:bg-neutral-900 lg:hidden"
                    aria-label="Next Month"
                  >
                    <ChevronRightIcon height={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center font-mono text-sm lowercase text-neutral-600"
                    >
                      {day}
                    </div>
                  ))}
                  {monthOneDates.map((row) =>
                    row.map((date) => (
                      <PickDateButton
                        key={`left-${stdFormat(date)}`}
                        date={date}
                        onSelect={change}
                        start={start}
                        end={end}
                        isCurrent={isFocusMonth}
                        min={min}
                        max={max}
                      />
                    ))
                  )}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="flex h-10 items-center justify-between">
                  <div className="opacity-0">
                    <ChevronLeftIcon height={18} />
                  </div>
                  <div>{format(addMonths(focusMonth, 1), 'MMMM yyyy')}</div>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="h-full rounded-lg px-2 hover:bg-neutral-900"
                    aria-label="Next Month"
                  >
                    <ChevronRightIcon height={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center font-mono text-sm lowercase text-neutral-600"
                    >
                      {day}
                    </div>
                  ))}
                  {monthTwoDates.map((row) =>
                    row.map((date) => (
                      <PickDateButton
                        key={`right-${stdFormat(date)}`}
                        date={date}
                        onSelect={change}
                        start={start}
                        end={end}
                        isCurrent={isFocusNextMonth}
                        min={min}
                        max={max}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="flex items-center gap-1 px-2 py-0.5 text-sm text-neutral-500 hover:text-neutral-50 disabled:hover:text-neutral-500"
                disabled={!start && !end}
                onClick={() => onChange({ start: undefined, end: undefined })}
              >
                <XMarkIcon height={12} />
                <span className="pb-0.5">clear</span>
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export const UncontrolledDateRangePicker: FC<
  Omit<DateRangePickerProps, 'start' | 'end' | 'onChange'> & {
    name?: string
    defaultValue?: { start: string; end: string }
  }
> = ({ name, defaultValue, ...props }) => {
  const [value, setValue] = useState<{
    start: Date | undefined
    end: Date | undefined
  }>(() => {
    if (defaultValue) {
      return {
        start: new Date(defaultValue.start),
        end: new Date(defaultValue.end),
      }
    }
    return { start: undefined, end: undefined }
  })

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={`${value.start ? format(value.start, 'yyyy-MM-dd') : 'null'}-${
          value.end ? format(value.end, 'yyyy-MM-dd') : 'null'
        }`}
      />
      <DateRangePicker
        {...props}
        start={value.start}
        end={value.end}
        onChange={(value) => setValue(value)}
      />
    </>
  )
}
