import { type Period, type Category, type Event } from '@prisma/client'
import { formatInTimeZone } from 'date-fns-tz'

const toICSString = (date: Date, timezone?: string): string => {
  return formatInTimeZone(date, timezone ?? 'UTC', "yyyyMMdd'T'HHmmss")
}

const toICSStringDate = (date: Date, timezone?: string): string => {
  return formatInTimeZone(date, timezone ?? 'UTC', 'yyyyMMdd')
}

type ICSableEvent = Pick<
  Event,
  'id' | 'createdAt' | 'datetime' | 'title' | 'timeStatus' | 'endDateTime'
> & { category?: Pick<Category, 'name'> }

export const createICSEvent = (event: ICSableEvent, timezone?: string) => {
  const icsArr = [
    `BEGIN:VEVENT`,
    `UID:${event.id}`,
    `DTSTAMP:${toICSString(event.createdAt, timezone)}`,
  ]

  if (event.timeStatus === 'STANDARD') {
    icsArr.push(`DTSTART:${toICSString(event.datetime, timezone)}`)
    if (event.endDateTime) {
      icsArr.push(`DTEND:${toICSString(event.endDateTime, timezone)}`)
    }
  } else {
    icsArr.push(
      `DTSTART;VALUE=DATE:${toICSStringDate(event.datetime, timezone)}`
    )
  }

  if (event.category) {
    icsArr.push(`CATEGORIES:${event.category.name}`)
  }

  return [...icsArr, `SUMMARY:${event.title}`, `END:VEVENT`].join('\n')
}

type ICSablePeriod = Pick<
  Period,
  'id' | 'createdAt' | 'startDate' | 'endDate' | 'name'
> & {
  category?: Pick<Category, 'name'>
}

export const createICSPeriod = (period: ICSablePeriod, timezone?: string) => {
  const icsArr = [
    `BEGIN:VEVENT`,
    `UID:${period.id}`,
    `DTSTAMP:${toICSString(period.createdAt, timezone)}`,
    `DTSTART;VALUE=DATE:${toICSStringDate(period.startDate, timezone)}`,
    `DTEND;VALUE=DATE:${toICSStringDate(period.endDate, timezone)}`,
  ]

  if (period.category) {
    icsArr.push(`CATEGORIES:${period.category.name}`)
  }

  return [...icsArr, `SUMMARY:${period.name}`, `END:VEVENT`].join('\n')
}

export const createCalendarIcs = (eventStrings: string[]): string => {
  return [
    `BEGIN:VCALENDAR`,
    `VERSION:2.0`,
    `PRODID:-//hacksw/handcal//NONSGML v1.0//EN`,
    ...eventStrings,
    `END:VCALENDAR`,
  ].join('\n')
}
