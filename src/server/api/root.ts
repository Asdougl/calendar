import { categoryRouter } from './routers/category'
import { followRouter } from './routers/follow'
import { periodsRouter } from './routers/periods'
import { preferencesRouter } from './routers/preferences'
import { profileRouter } from './routers/profile'
import { usersRouter } from './routers/users'
import { eventRouter } from '~/server/api/routers/event'
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'

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
  profile: profileRouter,
  follow: followRouter,
  users: usersRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
