import { render, screen } from '@testing-library/react'
import { addDays } from 'date-fns'
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
})
