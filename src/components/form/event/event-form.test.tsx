import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { type ComponentProps } from 'react'
import { addDays, format } from 'date-fns'
import { EventForm } from './event-form'
import { TestWrapper } from '~/test/wrapper'
import { createMockEvent } from '~/test/mock/events'
import { type RouterOutputs } from '~/trpc/shared'
import { ACCESSIBLE_FORMAT, displayFormat } from '~/components/ui/dates/common'

/*

Tests to make:
-> Check each input is behaving correctly
-> Check each input on both create and edit

Inputs (at current)
- Title
- Date
- Category
- Add Time
- Remove Time
- All Day
- Add Todo
- Remove Todo
- Time Picker
- See More
- Location
- Cancelled
- Delete
- Save

Handle Some more basic rules like:
- Time is required if timeStatus is STANDARD
- Date string + time string should be a valid date

Test Work In Progress values

*/

describe('event-form', () => {
  it('should render', () => {
    const submission = vi.fn()

    const testEvent = createMockEvent({
      title: 'Hello World',
    })

    render(
      <TestWrapper>
        <EventForm event={testEvent} onSubmit={submission} />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/title/i)).toHaveValue('Hello World')
  })

  // Skip until trpc-msw supports TRPC 11
  it('should submit edit changes', async () => {
    const user = userEvent.setup()

    let createdEvent: RouterOutputs['event']['one'] | null = null

    const submission = vi
      .fn<
        Parameters<NonNullable<ComponentProps<typeof EventForm>['onSubmit']>>
      >()
      .mockImplementation((event) => {
        createdEvent = event
      })

    const now = new Date()

    const testEvent = createMockEvent({
      title: 'Hello World',
      datetime: now,
    })

    render(
      <TestWrapper>
        <EventForm event={testEvent} onSubmit={submission} />
      </TestWrapper>
    )

    // Rename it!
    const title = screen.getByLabelText(/title/i)
    await user.clear(title)
    await user.type(title, 'Goodbye World')

    // update the date!
    const newDate = addDays(now, 3)
    const date = screen.getByText(displayFormat(now))
    await user.click(date)
    const inThreeDaysTime = screen.getByLabelText(
      format(newDate, ACCESSIBLE_FORMAT)
    )
    await user.click(inThreeDaysTime)

    // Make it all_day
    const allDay = screen.getByRole('button', { name: /all day/i })
    await user.click(allDay)

    // Add a location!
    const seymour = screen.getByRole('button', { name: /more/i })
    await user.click(seymour)
    const location = screen.getByLabelText(/location/i)
    await user.type(location, 'Seymour')

    // Submit It
    const submit = screen.getByRole('button', { name: /save/i })
    expect(submit).toBeEnabled()
    await user.click(submit)
    expect(submission).toHaveBeenCalledTimes(1)

    // Check the event
    expect(createdEvent).not.toBeNull()
    expect((createdEvent as RouterOutputs['event']['one'])?.title).toBe(
      'Goodbye World'
    )
    expect((createdEvent as RouterOutputs['event']['one'])?.timeStatus).toBe(
      'ALL_DAY'
    )
    expect(
      (createdEvent as RouterOutputs['event']['one'])?.datetime.getDate()
    ).toEqual(newDate.getDate())
  })

  it('should disable submit if nothing has changed', () => {
    const now = new Date()

    const testEvent = createMockEvent({
      title: 'Hello World',
      datetime: now,
    })

    render(
      <TestWrapper>
        <EventForm event={testEvent} onSubmit={vi.fn()} />
      </TestWrapper>
    )

    const submit = screen.getByRole('button', { name: /save/i })

    expect(submit).toBeDisabled()
  })

  // Skip until trpc-msw supports TRPC 11
  it.skip('should handle time input', async () => {
    const user = userEvent.setup()

    let createdEvent: RouterOutputs['event']['one'] | null = null

    const submission = vi
      .fn<
        Parameters<NonNullable<ComponentProps<typeof EventForm>['onSubmit']>>
      >()
      .mockImplementation((event) => {
        createdEvent = event
      })

    const now = new Date()

    render(
      <TestWrapper>
        <EventForm date={now} onSubmit={submission} />
      </TestWrapper>
    )

    const title = screen.getByLabelText(/title/i)
    await user.type(title, 'Hello World')

    const addTime = screen.getByRole('button', { name: /add time/i })
    await user.click(addTime)

    // Set the time to 8:30pm

    const eightHours = screen.getByRole('button', { name: /hour 8/i })
    await user.click(eightHours)

    const thirtyMinutes = screen.getByRole('button', { name: /minute 30/i })
    await user.click(thirtyMinutes)

    const pm = screen.getByRole('button', { name: /pm/i })
    await user.click(pm)

    const submit = screen.getByRole('button', { name: /save/i })
    await user.click(submit)

    expect(createdEvent).not.toBeNull()
    expect((createdEvent as RouterOutputs['event']['one'])?.title).toBe(
      'Hello World'
    )
    expect(
      (createdEvent as RouterOutputs['event']['one'])?.datetime.getHours()
    ).toBe(20)
    expect(
      (createdEvent as RouterOutputs['event']['one'])?.datetime.getMinutes()
    ).toBe(30)

    // Let's clear out the time!

    const clearTime = screen.getByRole('button', { name: /clear time/i })
    await user.click(clearTime)

    await user.click(submit)

    expect(
      (createdEvent as RouterOutputs['event']['one'])?.datetime.getHours()
    ).toBe(12)
    expect(
      (createdEvent as RouterOutputs['event']['one'])?.datetime.getMinutes()
    ).toBe(0)
  })

  it('should render correct time input', () => {
    const now = new Date()
    now.setHours(19, 30, 0, 0)

    const testEvent = createMockEvent({
      datetime: now,
    })

    render(
      <TestWrapper>
        <EventForm event={testEvent} onSubmit={vi.fn()} />
      </TestWrapper>
    )

    const hours = screen.getByRole('button', { name: /hour \d+ selected/i })
    expect(hours).toHaveTextContent('7')

    const minutes = screen.getByRole('button', { name: /minute \d+ selected/i })
    expect(minutes).toHaveTextContent('30')

    const pm = screen.getByRole('button', { name: /pm selected/i })
    expect(pm).toBeInTheDocument()
  })
})
