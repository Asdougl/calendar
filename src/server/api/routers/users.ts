import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        name: true,
        image: true,
        privacy: true,
        email: true,
        handle: {
          select: {
            value: true,
          },
        },
      },
    })
  }),
  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(250) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      })
    }),
  updateHandle: protectedProcedure
    .input(z.object({ value: z.string().min(1).max(250) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.handle.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        create: {
          value: input.value,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        update: {
          value: input.value,
        },
      })
    }),
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
