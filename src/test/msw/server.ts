import { setupServer } from 'msw/node'
import { createTRPCMsw } from 'msw-trpc'
import superjson from 'superjson'
import { TimeStatus } from '@prisma/client'
import { createMockEvent } from '../mock/events'
import { createMockCategory } from '../mock/categories'
import { type AppRouter } from '~/server/api/root'

const trpcMsw = createTRPCMsw<AppRouter>({
  transformer: { input: superjson, output: superjson },
})

export const server = setupServer(
  // EVENTS
  trpcMsw.event.create.mutation((ctx) => {
    // if time status is all day, set the time to 12:00
    if (
      ctx.timeStatus &&
      (ctx.timeStatus === TimeStatus.ALL_DAY ||
        ctx.timeStatus === TimeStatus.NO_TIME)
    ) {
      ctx.datetime = new Date(ctx.datetime.setHours(12, 0, 0, 0))
    }

    return createMockEvent(ctx)
  }),
  trpcMsw.event.update.mutation((ctx) => {
    if (
      ctx.datetime && // mad caveat -- actual endpoint handles no datetime but mocked cannot
      ctx.timeStatus &&
      (ctx.timeStatus === TimeStatus.ALL_DAY ||
        ctx.timeStatus === TimeStatus.NO_TIME)
    ) {
      ctx.datetime = new Date(ctx.datetime.setHours(12, 0, 0, 0))
    }
    return createMockEvent(ctx)
  }),
  trpcMsw.event.delete.mutation((ctx) => {
    return createMockEvent(ctx)
  }),

  // CATEGORIES
  trpcMsw.category.all.query(() => {
    return [
      createMockCategory({ name: 'Blue', color: 'blue' }),
      createMockCategory({ name: 'Red', color: 'red' }),
      createMockCategory({ name: 'Green', color: 'green' }),
    ]
  }),

  // PREFERENCES
  trpcMsw.preferences.getAll.query(() => {
    return {
      weekends: 'left' as const,
      timezone: 'Australia/Sydney',
      timeFormat: '12' as const,
      developer: false,
    }
  })
)
