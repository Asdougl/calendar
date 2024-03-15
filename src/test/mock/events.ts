import { type RouterOutputs } from '~/trpc/shared'
import { createTempId } from '~/utils/misc'

type RangeEvent = RouterOutputs['event']['range'][number]

export const createMockEvent = (partial?: Partial<RangeEvent>): RangeEvent => {
  return {
    id: createTempId(),
    title: 'Test Event',
    datetime: new Date(),
    timeStatus: 'STANDARD',
    location: 'Test Event Location',
    endDateTime: null,
    category: null,
    done: null,
    cancelled: false,
    recursion: null,
    ...partial,
  }
}

const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

type MockEventsConfig = {
  start: Date
  end: Date
  title?: (index: number) => string
}

export const createMockEvents = (count: number, config?: MockEventsConfig) => {
  const events: RangeEvent[] = []

  for (let i = 0; i < count; i++) {
    events.push(
      createMockEvent(
        config && {
          datetime: randomDate(config.start, config.end),
          title: config.title ? config.title(i) : undefined,
        }
      )
    )
  }

  return events
}
