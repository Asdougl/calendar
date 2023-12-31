import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const select = {
  id: true,
  name: true,
  color: true,
}

export const categoryRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      select,
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
        select,
      })
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.category.create({
        data: {
          name: input.name,
          color: input.color,
          createdById: ctx.session.user.id,
        },
        select,
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.category.update({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: {
          name: input.name,
          color: input.color,
        },
        select,
      })
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.category.delete({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        select,
      })
    }),
})
