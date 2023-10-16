import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
    })
  }),
  one: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.category.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
      })
    }),
})
