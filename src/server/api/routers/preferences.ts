import { createTRPCRouter, protectedProcedure } from '../trpc'
import { Preferences } from '~/types/preferences'

export const preferencesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        preferences: true,
      },
    })
    return result?.preferences
      ? Preferences.parse(result.preferences)
      : Preferences.parse({})
  }),
  update: protectedProcedure
    .input(Preferences)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          preferences: input,
        },
        select: {
          preferences: true,
        },
      })
      return Preferences.parse(result.preferences)
    }),
})
