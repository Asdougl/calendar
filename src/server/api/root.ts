import { categoryRouter } from './routers/category'
import { periodsRouter } from './routers/periods'
import { preferencesRouter } from './routers/preferences'
import { eventRouter } from '~/server/api/routers/event'
import { createTRPCRouter } from '~/server/api/trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  event: eventRouter,
  category: categoryRouter,
  preferences: preferencesRouter,
  periods: periodsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
