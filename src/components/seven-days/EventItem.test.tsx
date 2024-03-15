import { render, screen } from '@testing-library/react'
import { add, set } from 'date-fns'
import { EventItem } from './EventItem'
import { TestWrapper } from '~/test/wrapper'
import { createMockEvent } from '~/test/mock/events'

describe('EventItem', () => {
  it('should render', () => {
    const mockEvent = createMockEvent({
      title: 'Hello World',
      datetime: set(new Date(), { hours: 10, minutes: 30 }),
      timeStatus: 'STANDARD',
    })

    render(
      <TestWrapper>
        <EventItem event={mockEvent} />
      </TestWrapper>
    )

    expect(screen.getByText('Hello World')).toBeInTheDocument()
    expect(screen.getByText('10:30 am')).toBeInTheDocument()
  })

  it('should mark as complete', () => {
    const mockEvent = createMockEvent({
      title: 'Hello World',
      datetime: add(set(new Date(), { hours: 10, minutes: 30 }), { days: -1 }),
      timeStatus: 'STANDARD',
    })

    const util = render(
      <TestWrapper>
        <EventItem event={mockEvent} />
      </TestWrapper>
    )

    const title = screen.getByText('Hello World')

    expect(title).toHaveClass('line-through')

    mockEvent.datetime = add(mockEvent.datetime, { days: 2 })

    util.rerender(
      <TestWrapper>
        <EventItem event={mockEvent} />
      </TestWrapper>
    )

    expect(title).not.toHaveClass('line-through')
  })

  it('should show all day events', () => {
    const mockEvent = createMockEvent({
      title: 'Hello World',
      datetime: new Date(),
      timeStatus: 'ALL_DAY',
    })

    render(
      <TestWrapper>
        <EventItem event={mockEvent} />
      </TestWrapper>
    )

    expect(screen.getByText('All Day')).toBeInTheDocument()
  })

  it('should show untimed events', () => {
    const mockEvent = createMockEvent({
      title: 'Hello World',
      datetime: set(new Date(), { hours: 10, minutes: 30 }),
      timeStatus: 'NO_TIME',
    })

    render(
      <TestWrapper>
        <EventItem event={mockEvent} />
      </TestWrapper>
    )

    expect(screen.queryByText('All Day')).toBeFalsy()
    expect(screen.queryByText('10:30 am')).toBeFalsy()
  })
})
