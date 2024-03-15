import { addDays, startOfWeek } from 'date-fns'
import { eventsByDay } from '../sort'
import { createMockEvent } from '~/test/mock/events'

const MONDAY = startOfWeek(new Date(), { weekStartsOn: 1 })
const TUESDAY = addDays(MONDAY, 1)
const WEDNESDAY = addDays(MONDAY, 2)
// const THURSDAY = addDays(MONDAY, 3)
const FRIDAY = addDays(MONDAY, 4)
const SATURDAY = addDays(MONDAY, 5)
const SUNDAY = addDays(MONDAY, 6)

const events = [
  // first has 1
  createMockEvent({ datetime: MONDAY }),
  // second has 3
  createMockEvent({ datetime: TUESDAY }),
  createMockEvent({ datetime: TUESDAY }),
  createMockEvent({ datetime: TUESDAY }),
  // third has 1
  createMockEvent({ datetime: WEDNESDAY }),
  // fourth has 0 / non existent
  // fifth has 2
  createMockEvent({ datetime: FRIDAY }),
  createMockEvent({ datetime: FRIDAY }),
  // sixth has 1
  createMockEvent({ datetime: SATURDAY }),
  // seventh has 2
  createMockEvent({ datetime: SUNDAY }),
  createMockEvent({ datetime: SUNDAY }),
]

describe('sort utils', () => {
  it('should sort events by day', () => {
    const sorted = eventsByDay(events)

    // Monday
    expect(sorted[1]).toHaveLength(1)
    // Tuesday
    expect(sorted[2]).toHaveLength(3)
    // Wednesday
    expect(sorted[3]).toHaveLength(1)
    // Thursday
    expect(sorted[4]).toBeUndefined()
    // Friday
    expect(sorted[5]).toHaveLength(2)
    // Saturday
    expect(sorted[6]).toHaveLength(1)
    // Sunday
    expect(sorted[0]).toHaveLength(2)
  })
})
