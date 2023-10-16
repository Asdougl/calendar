import {
  addDays,
  endOfWeek,
  getDate,
  getDay,
  getDayOfYear,
  set,
  startOfWeek,
} from 'date-fns'

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
