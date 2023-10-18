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
  todos: protectedProcedure
    .input(z.object({ done: z.boolean() }))
    .query(({ ctx, input }) => {
      const doneQuery = input.done
        ? {
            NOT: {
              done: null,
            },
          }
        : {
            done: false,
          }

      return ctx.db.event.findMany({
        where: {
          createdById: ctx.session.user.id,
          ...doneQuery,
        },
      })
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        datetime: z.date(),
        categoryId: z.string().optional(),
        todo: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          title: input.title,
          datetime: input.datetime,
          categoryId: input.categoryId,
          createdById: ctx.session.user.id,
          done: input.todo ? false : null,
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
        done: z.boolean().nullable().optional(),
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
          done: input.done,
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
