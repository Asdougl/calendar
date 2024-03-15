import { addDays, startOfWeek } from 'date-fns'
import { render, screen } from '@testing-library/react'
import { DayOfWeek } from './DayOfWeek'
import { TestWrapper } from '~/test/wrapper'
import { createMockEvent } from '~/test/mock/events'
import { eventsByDay } from '~/utils/sort'

const MONDAY = startOfWeek(new Date(2024, 2, 11), { weekStartsOn: 1 })
const TUESDAY = addDays(MONDAY, 1)
const WEDNESDAY = addDays(MONDAY, 2)
// const THURSDAY = addDays(MONDAY, 3)
const FRIDAY = addDays(MONDAY, 4)
const SATURDAY = addDays(MONDAY, 5)
const SUNDAY = addDays(MONDAY, 6)

const MOCK_EVENTS = [
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

const EVENTS_BY_DAY = eventsByDay(MOCK_EVENTS)

describe('DayOfWeek', () => {
  it('should render', () => {
    render(
      <TestWrapper>
        <DayOfWeek events={EVENTS_BY_DAY} baseDate={MONDAY} dayOfWeek={2} />
      </TestWrapper>
    )

    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Mar')).toBeInTheDocument()
  })

  it('should render all day first', () => {
    const eventsByDay = [
      [],
      [
        createMockEvent({ title: 'event' }),
        createMockEvent({ title: 'event' }),
        createMockEvent({ title: 'event - all day', timeStatus: 'ALL_DAY' }),
        createMockEvent({ title: 'event' }),
      ],
    ]

    render(
      <TestWrapper>
        <DayOfWeek events={eventsByDay} baseDate={new Date()} dayOfWeek={1} />
      </TestWrapper>
    )

    const events = screen.getAllByText(/event/i)

    expect(events).toHaveLength(4)
    expect(events[0]).toHaveTextContent('event - all day')
  })
})
