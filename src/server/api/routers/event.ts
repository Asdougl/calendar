import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const eventRouter = createTRPCRouter({
  range: protectedProcedure
    .input(z.object({ start: z.date(), end: z.date() }))
    .query(({ ctx, input }) => {
      return ctx.db.event.findMany({
        where: {
          createdById: ctx.session.user.id,
          datetime: {
            gte: input.start,
            lt: input.end,
          },
        },
        include: {
          category: true,
        },
      })
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        datetime: z.date(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          title: input.title,
          datetime: input.datetime,
          categoryId: input.categoryId,
          createdById: ctx.session.user.id,
        },
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        datetime: z.date().optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.event.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          datetime: input.datetime,
          categoryId: input.categoryId,
        },
      })
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.event.delete({
        where: {
          id: input.id,
        },
      })
    }),
})
