import { type TimeStatus } from '@prisma/client'
import { addDays, getDay } from 'date-fns'

type EventSortEvent = {
  datetime: Date
  timeStatus: TimeStatus
}

export const eventSort = (a: EventSortEvent, b: EventSortEvent) => {
  if (a.timeStatus === 'ALL_DAY') return -1
  if (b.timeStatus === 'ALL_DAY') return 1
  if (a.timeStatus === 'NO_TIME') return 1
  if (b.timeStatus === 'NO_TIME') return -1
  if (a.datetime < b.datetime) return -1
  if (a.datetime > b.datetime) return 1
  return 0
}

export const eventsByDay = <T extends { datetime: Date }>(events: T[]) => {
  if (!events?.length) return []

  const eventsByDay: T[][] = []

  events.forEach((event) => {
    const dayOfWeek = getDay(event.datetime)
    const thisDay = eventsByDay[dayOfWeek]
    if (thisDay) thisDay?.push(event)
    else eventsByDay[dayOfWeek] = [event]
  })

  return eventsByDay
}

export const createPeriodsByDaySorter =
  (focusDate?: Date | null) =>
  <T extends { startDate: Date; endDate: Date }>(periods: T[]) => {
    if (!periods?.length) return []

    const periodsByDay: T[][] = []

    const daysOfFocus: Date[] = []
    for (let i = 0; i < 7; i++) {
      focusDate && daysOfFocus.push(addDays(focusDate, i))
    }

    periods.forEach((period) => {
      daysOfFocus.forEach((day) => {
        if (period.startDate <= day && period.endDate >= day) {
          const thisDay = periodsByDay[getDay(day)]
          if (thisDay) thisDay?.push(period)
          else periodsByDay[getDay(day)] = [period]
        }
      })
    })

    return periodsByDay
  }
