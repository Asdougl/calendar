import { type Event } from '@prisma/client'
import {
  addDays,
  differenceInCalendarDays,
  differenceInDays,
  endOfDay,
  endOfWeek,
  format,
  getDate,
  getDay,
  getUnixTime,
  set,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { type RouterOutputs } from '~/trpc/shared'

const seconds = (seconds: number) => seconds * 1000
const minutes = (minutes: number) => seconds(minutes * 60)
const hours = (hours: number) => minutes(hours * 60)
const days = (days: number) => hours(days * 24)
const weeks = (weeks: number) => days(weeks * 7)

// export const Duration = {
//   seconds,
//   minutes,
//   hours,
//   days,
//   weeks,
//   create: ({
//     seconds: secondCount = 0,
//     minutes: minuteCount = 0,
//     hours: hoursCount = 0,
//     days: daysCount = 0,
//     weeks: weeksCount = 0,
//   }) => {
//     return (
//       seconds(secondCount) +
//       minutes(minuteCount) +
//       hours(hoursCount) +
//       days(daysCount) +
//       weeks(weeksCount)
//     )
//   },
// } as const

export class Duration {
  static seconds = seconds
  static minutes = minutes
  static hours = hours
  static days = days
  static weeks = weeks
  static create = ({
    seconds: secondCount = 0,
    minutes: minuteCount = 0,
    hours: hoursCount = 0,
    days: daysCount = 0,
    weeks: weeksCount = 0,
  }) => {
    return (
      seconds(secondCount) +
      minutes(minuteCount) +
      hours(hoursCount) +
      days(daysCount) +
      weeks(weeksCount)
    )
  }
}

/** @deprecated */
export const time = {
  seconds: (seconds: number) => seconds * 1000,
  minutes: (minutes: number) => minutes * 60 * 1000,
  hours: (hours: number) => hours * 60 * 60 * 1000,
  days: (days: number) => days * 24 * 60 * 60 * 1000,
} as const

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
  const dayOfFirstOfMonth = getDay(firstOfMonth)
  const weeks = Math.ceil(
    (differenceInDays(lastOfMonth, firstOfMonth) +
      (dayOfFirstOfMonth < 1 ? dayOfFirstOfMonth + 7 : dayOfFirstOfMonth)) /
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rows[i][j] = focusDay
      focusDay = addDays(focusDay, 1)
    }
  }

  return rows
}

export const weekDatesOfDateRange = (start: Date, end: Date) => {
  const startOfPeriod = startOfWeek(start, { weekStartsOn: 1 })
  const endOfPeriod = endOfWeek(end, { weekStartsOn: 1 })

  const weeks = Math.ceil(differenceInDays(endOfPeriod, startOfPeriod) / 7)

  let focusDay = startOfPeriod

  const rows: Date[][] = []

  for (let i = 0; i < weeks; i++) {
    rows[i] = []
    for (let j = 0; j < 7; j++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rows[i][j] = focusDay
      focusDay = addDays(focusDay, 1)
    }
  }

  return rows
}

export const toCalendarDate = (date: Date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

export const getUtcTime = (yearMonthDate: string, time?: string) => {
  return getUnixTime(
    zonedTimeToUtc(`${yearMonthDate}T${time || '00:00:00.0000'}Z`, 'UTC')
  )
}

export const dateFromDateAndTime = (date: string, time?: string | null) => {
  const dateObj = new Date()

  const dateSplit = date.split('-')
  const withDate = set(dateObj, {
    year: parseInt(dateSplit[0] || ''),
    month: parseInt(dateSplit[1] || '') - 1,
    date: parseInt(dateSplit[2] || ''),
  })

  if (time) {
    const timeSplit = time.split(':')
    return set(withDate, {
      hours: parseInt(timeSplit[0] || ''),
      minutes: parseInt(timeSplit[1] || ''),
    })
  } else {
    return startOfDay(withDate)
  }
}

export const isValidDateString = (dateString: string) => {
  const date = new Date(dateString)

  return !isNaN(date.getTime())
}

export const daysAway = (date: Date) => {
  const today = startOfDay(new Date())

  // how far away, e.g. today, tomorrow, yesterday, in 2 days, 10 days ago
  const days = differenceInCalendarDays(date, today)

  if (days === 0) {
    return 'today'
  } else if (days === 1) {
    return 'tomorrow'
  } else if (days === -1) {
    return 'yesterday'
  } else if (days > 0) {
    return `in ${days} days`
  } else {
    return `${Math.abs(days)} days ago`
  }
}

export const timeFormat = (
  date: Date,
  preferences?: RouterOutputs['preferences']['getAll']
) => {
  return format(date, preferences?.timeFormat === '24' ? 'HH:mm' : 'h:mm a')
}

export const isEventComplete = (
  event: Pick<Event, 'datetime' | 'done' | 'cancelled' | 'timeStatus'>
) => {
  const now = new Date()

  if (event.cancelled) return true

  if (event.done !== null && event.done) return true

  if (event.timeStatus === 'ALL_DAY' || event.timeStatus === 'NO_TIME')
    return endOfDay(event.datetime) < now

  return event.datetime < now
}
