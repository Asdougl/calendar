import { useState, type FC, useMemo } from 'react'
import * as Popover from '@radix-ui/react-popover'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import {
  format,
  getDate,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  set,
  setMonth,
  setYear,
  startOfDay,
} from 'date-fns'
import { Button } from '../button'
import { NumberInput } from '../input/number'
import {
  MONTH_OPTIONS,
  accessibleFormat,
  daysOfWeek,
  displayFormat,
  getInitialFocus,
  isDisabled,
  stdFormat,
} from './common'
import { cn } from '~/utils/classnames'
import { getMonthDates } from '~/utils/dates'

type DatePickerProps = {
  value: Date
  onChange: (date: Date) => void
  min?: Date
  max?: Date
  className?: string
  id?: string
}

export const DatePicker: FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  className,
  id,
}) => {
  const [focusMonth, setFocusMonth] = useState(() => getInitialFocus(value))
  const [open, setOpen] = useState(false)
  const [yearError, setYearError] = useState<'min' | 'max' | null>(null)

  const monthDates = useMemo(() => {
    return getMonthDates(getYear(focusMonth), getMonth(focusMonth))
  }, [focusMonth])

  const change = (chosen: Date) => {
    onChange(new Date(chosen))
    if (!isSameMonth(chosen, focusMonth)) {
      setFocusMonth(
        set(focusMonth, { month: getMonth(chosen), year: getYear(chosen) })
      )
    }
    setOpen(false)
  }

  const nextMonth = () => {
    setFocusMonth(setMonth(focusMonth, getMonth(focusMonth) + 1))
  }

  const prevMonth = () => {
    setFocusMonth(setMonth(focusMonth, getMonth(focusMonth) - 1))
  }

  const today = new Date()

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button id={id} className={cn('flex items-center gap-2', className)}>
          <CalendarIcon height={20} />
          <span>{displayFormat(value)}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="relative z-10 w-screen p-2 md:w-auto"
          aria-label="date picker"
        >
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2">
            <div className="flex h-10 justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="rounded-lg px-2 hover:bg-neutral-900"
                aria-label="Previous Month"
              >
                <ChevronLeftIcon height={18} />
              </button>
              <select
                value={getMonth(focusMonth)}
                onChange={(e) =>
                  setFocusMonth(setMonth(focusMonth, +e.currentTarget.value))
                }
                aria-label="month"
                className="rounded-lg bg-neutral-950 text-neutral-50 hover:bg-neutral-900"
              >
                {MONTH_OPTIONS}
              </select>
              {/* rework this because it's shit */}
              <NumberInput
                aria-label="year"
                value={getYear(focusMonth)}
                onChange={(value, error) => {
                  setFocusMonth(setYear(focusMonth, value))
                  setYearError(error ?? null)
                }}
                error={!!yearError}
                max={2100}
                min={1901}
                className="w-12 rounded-lg border-none bg-neutral-950 px-1 py-0 leading-tight text-neutral-50 hover:bg-neutral-900"
              />
              <button
                type="button"
                onClick={nextMonth}
                className="rounded-lg px-2 hover:bg-neutral-900"
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
              {monthDates.map((row) =>
                row.map((date) => {
                  const current = value ? isSameDay(date, value) : false
                  const isToday = isSameDay(date, today)

                  let ariaLabel = accessibleFormat(date)
                  if (isToday) ariaLabel += ', today'
                  if (current) ariaLabel += ', selected date'

                  return (
                    <button
                      // ref={isToday ? todayRef : undefined}
                      type="button"
                      disabled={isDisabled(date, min, max)}
                      key={stdFormat(date)}
                      aria-label={ariaLabel}
                      className={cn(
                        'h-10 w-auto rounded-lg border text-lg hover:bg-neutral-900 disabled:opacity-10 md:w-10',
                        {
                          'opacity-60': getMonth(date) !== getMonth(focusMonth),
                          'border-neutral-500 bg-neutral-500 text-neutral-50':
                            current,
                          'border-neutral-500': isToday,
                          'border-transparent': !current && !isToday,
                        }
                      )}
                      onClick={() => change(date)}
                    >
                      {getDate(date)}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export const UncontrolledDatePicker: FC<
  Omit<DatePickerProps, 'value' | 'onChange'> & {
    name?: string
    defaultValue?: string
  }
> = ({ name, defaultValue, ...props }) => {
  const [value, setValue] = useState(
    defaultValue ? new Date(defaultValue) : new Date()
  )

  const onChange = (date: Date) => {
    setValue(startOfDay(date))
  }

  return (
    <>
      <input name={name} type="hidden" value={format(value, 'yyyy-MM-dd')} />
      <DatePicker value={value} onChange={onChange} {...props} />
    </>
  )
}
