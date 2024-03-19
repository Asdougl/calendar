import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(250) }))
    .query(({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: {
          id: {
            not: ctx.session.user.id,
          },
          name: {
            contains: input.query,
            mode: 'insensitive',
          },
          privacy: {
            in: ['PUBLIC', 'PRIVATE'],
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
          Followers: {
            where: {
              followerId: ctx.session.user.id,
            },
          },
        },
      })
    }),
})
