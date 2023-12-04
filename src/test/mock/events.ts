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
    ...partial,
  }
}

export const createMockEvents = (count: number) => {
  const events: RangeEvent[] = []

  for (let i = 0; i < count; i++) {
    events.push(createMockEvent())
  }

  return events
}
