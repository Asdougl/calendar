import { useState, type FC, useMemo } from 'react'
import * as Popover from '@radix-ui/react-popover'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import {
  add,
  endOfWeek,
  format,
  getDate,
  getDay,
  getDayOfYear,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  set,
  setDate,
  setMonth,
  setYear,
  startOfWeek,
} from 'date-fns'
import { Button } from '../button'
import { cn } from '@/util/classnames'

const MONTH_OPTIONS = [
  <option key={0} value={0}>
    January
  </option>,
  <option key={1} value={1}>
    February
  </option>,
  <option key={2} value={2}>
    March
  </option>,
  <option key={3} value={3}>
    April
  </option>,
  <option key={4} value={4}>
    May
  </option>,
  <option key={5} value={5}>
    June
  </option>,
  <option key={6} value={6}>
    July
  </option>,
  <option key={7} value={7}>
    August
  </option>,
  <option key={8} value={8}>
    September
  </option>,
  <option key={9} value={9}>
    October
  </option>,
  <option key={10} value={10}>
    November
  </option>,
  <option key={11} value={11}>
    December
  </option>,
]

const stdFormat = (date: Date) => format(date, 'yyyy-MM-dd')
const displayFormat = (date: Date) => format(date, 'd MMM yy')

export const getMonthDates = (year: number, month: number) => {
  const firstOfMonth = set(new Date(), {
    year,
    month,
    date: 1,
  })

  const lastOfMonth = set(new Date(), {
    year,
    month: month + 1,
    date: 0,
  })

  // number of weeks in a month when week starts on Monday
  const weeks = Math.ceil(
    (getDayOfYear(endOfWeek(lastOfMonth, { weekStartsOn: 1 })) -
      getDayOfYear(startOfWeek(firstOfMonth, { weekStartsOn: 1 }))) /
      7
  )

  let focusDay = set(new Date(), {
    year,
    month,
    date: 1,
  })

  const focusDayOfWeek = getDay(focusDay)

  focusDay = set(focusDay, {
    date:
      getDate(focusDay) -
      (focusDayOfWeek < 1 ? focusDayOfWeek + 6 : focusDayOfWeek - 1),
  })

  const rows: Date[][] = []
  for (let i = 0; i < weeks; i++) {
    rows[i] = []
    for (let j = 0; j < 7; j++) {
      rows[i][j] = focusDay
      focusDay = add(focusDay, { days: 1 })
    }
  }

  return rows
}

const isDisabled = (test: Date, min?: Date, max?: Date) => {
  if (max && isAfter(test, max)) {
    return true
  }
  if (min && isBefore(test, min)) {
    return true
  }
  return false
}

const getInitialFocus = () => {
  return setDate(new Date(), 1)
}

type DatePickerProps = {
  value: Date
  onChange: (date: Date) => void
  min?: Date
  max?: Date
  className?: string
}

export const DatePicker: FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  className,
}) => {
  const [focusMonth, setFocusMonth] = useState(getInitialFocus())
  const [open, setOpen] = useState(false)

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

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button className={cn('flex gap-2 items-center', className)}>
          <CalendarIcon height={20} />
          <span>{displayFormat(value)}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="p-2 relative z-10 w-screen md:w-auto">
          <div className="bg-neutral-950 p-2 border border-neutral-800 rounded-lg">
            <div className="flex justify-between h-10">
              <button
                type="button"
                onClick={prevMonth}
                className="px-2 hover:bg-neutral-900 rounded-lg"
              >
                <ChevronLeftIcon height={18} />
              </button>
              <select
                value={getMonth(focusMonth)}
                onChange={(e) =>
                  setFocusMonth(setMonth(focusMonth, +e.currentTarget.value))
                }
                className="bg-neutral-950 text-neutral-50 hover:bg-neutral-900 rounded-lg"
              >
                {MONTH_OPTIONS}
              </select>
              <input
                type="number"
                min={1901}
                max={2100}
                value={getYear(focusMonth)}
                onChange={(e) =>
                  setFocusMonth(setYear(focusMonth, +e.currentTarget.value))
                }
                className="bg-neutral-950 text-neutral-50 hover:bg-neutral-900 rounded-lg"
              />
              <button
                type="button"
                onClick={nextMonth}
                className="px-2 hover:bg-neutral-900 rounded-lg"
              >
                <ChevronRightIcon height={18} />
              </button>
            </div>
            <div className="grid grid-cols-7">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-neutral-600 text-center lowercase text-sm font-mono"
                >
                  {day}
                </div>
              ))}
              {monthDates.map((row) =>
                row.map((date) => {
                  const current = value ? isSameDay(date, value) : false
                  const isToday = isSameDay(date, today)
                  return (
                    <button
                      // ref={isToday ? todayRef : undefined}
                      type="button"
                      disabled={isDisabled(date, min, max)}
                      key={stdFormat(date)}
                      aria-labelledby={stdFormat(date)}
                      className={cn(
                        'h-10 w-auto md:w-10 rounded-lg disabled:opacity-10 border text-lg hover:bg-neutral-900',
                        {
                          'opacity-60': getMonth(date) !== getMonth(focusMonth),
                          'bg-neutral-500 text-neutral-50 border-neutral-500':
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
    name: string
    defaultValue: string
  }
> = ({ name, defaultValue, ...props }) => {
  const [value, setValue] = useState(new Date(defaultValue))

  const onChange = (date: Date) => {
    setValue(set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }))
  }

  return (
    <>
      <input name={name} type="hidden" value={value.toISOString()} />
      <DatePicker value={value} onChange={onChange} {...props} />
    </>
  )
}
