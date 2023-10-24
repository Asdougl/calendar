import {
  addDays,
  differenceInDays,
  endOfWeek,
  getDate,
  getDay,
  getDayOfYear,
  getUnixTime,
  set,
  startOfWeek,
} from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

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

export const dateFromDateAndTime = (date: string, time: string) => {
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
  }

  return withDate
}
