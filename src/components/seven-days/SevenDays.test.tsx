import { render, screen } from '@testing-library/react'
import { addDays, setDay, startOfWeek } from 'date-fns'
import { SevenDaysShell } from './SevenDays'
import { createMockEvents } from '~/test/mock/events'
import { eventsByDay } from '~/utils/sort'
import { TestWrapper } from '~/test/wrapper'

const START = new Date()
const END = addDays(START, 7)

const MOCK_EVENTS = createMockEvents(12, {
  start: START,
  end: END,
  title: (index) => `Test Event ${index + 1}`,
})

const SORTED_EVENTS = eventsByDay(MOCK_EVENTS)

const findEvent = (id: string) => MOCK_EVENTS.find((event) => event.id === id)

const BASE_ORDER = [
  { label: 'Sat', value: 6 },
  { label: 'Fri', value: 5 },
  { label: 'Thu', value: 4 },
  { label: 'Wed', value: 3 },
  { label: 'Sun', value: 0 },
  { label: 'Tue', value: 2 },
  { label: 'Mon', value: 1 },
]

describe('SevenDays', () => {
  it('should render', () => {
    render(
      <TestWrapper>
        <SevenDaysShell
          start={START}
          end={END}
          events={SORTED_EVENTS}
          findEvent={findEvent}
          updateEvent={vi.fn()}
          usedIn="inbox"
        />
      </TestWrapper>
    )
  })

  it('should render all events', () => {
    render(
      <TestWrapper>
        <SevenDaysShell
          start={START}
          end={END}
          events={SORTED_EVENTS}
          findEvent={findEvent}
          updateEvent={vi.fn()}
          usedIn="inbox"
        />
      </TestWrapper>
    )

    MOCK_EVENTS.forEach((event) => {
      expect(screen.getByText(event.title)).toBeInTheDocument()
    })
  })

  it.each([0, 1, 2, 3, 4, 5, 6] as const)(
    'should render days in order when weekStart is %i',
    (dayOfWeek) => {
      const baseDate = setDay(
        startOfWeek(START, { weekStartsOn: 1 }),
        dayOfWeek,
        { weekStartsOn: 1 }
      )
      const endDate = addDays(baseDate, 7)

      render(
        <TestWrapper>
          <SevenDaysShell
            start={baseDate}
            end={endDate}
            events={eventsByDay([])}
            findEvent={vi.fn()}
            updateEvent={vi.fn()}
            usedIn="inbox"
            weekStart={dayOfWeek}
          />
        </TestWrapper>
      )

      const dayLabels = screen.getAllByTestId('day-of-week')
      const dateLabels = screen.getAllByTestId('date-of-month')

      expect(dayLabels.length).toBe(7)

      const order = BASE_ORDER.map((day) => ({
        label: day.label,
        diff: (dayOfWeek > day.value ? day.value + 7 : day.value) - dayOfWeek,
      }))

      for (let i = 0; i < order.length; i++) {
        expect(dayLabels[i]).toHaveTextContent(order[i]?.label || 'Nope')
        const dateLabel = parseInt(dateLabels[i]?.textContent || '0', 10)
        expect(dateLabel).toBe(addDays(baseDate, order[i]?.diff || 0).getDate())
      }
    }
  )
})
