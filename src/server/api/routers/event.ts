import { z } from 'zod'
import { TimeStatus } from '@prisma/client'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const select = {
  id: true,
  title: true,
  datetime: true,
  timeStatus: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
}

export const eventRouter = createTRPCRouter({
  range: protectedProcedure
    .input(z.object({ start: z.date(), end: z.date() }))
    .query(({ ctx, input }) => {
      return ctx.db.event.findMany({
        where: {
          createdById: ctx.session.user.id,
          OR: [
            {
              datetime: {
                gte: input.start.toISOString(),
                lt: input.end.toISOString(),
              },
            },
          ],
        },
        select,
        orderBy: {
          datetime: 'asc',
        },
      })
    }),
  one: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.event.findUnique({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        select,
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
        select: {
          ...select,
          done: true,
        },
      })
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        datetime: z.date(),
        timeStatus: z
          .enum([TimeStatus.ALL_DAY, TimeStatus.NO_TIME, TimeStatus.STANDARD])
          .default(TimeStatus.STANDARD),
        categoryId: z.string().optional(),
        todo: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          title: input.title,
          datetime: input.datetime,
          timeStatus: input.timeStatus,
          categoryId: input.categoryId,
          createdById: ctx.session.user.id,
          done: input.todo ? false : null,
        },
        select,
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        datetime: z.date().optional(),
        timeStatus: z
          .enum([TimeStatus.ALL_DAY, TimeStatus.NO_TIME, TimeStatus.STANDARD])
          .optional(),
        categoryId: z.string().nullable().optional(),
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
          timeStatus: input.timeStatus,
          categoryId: input.categoryId,
          done: input.done,
        },
        select,
      })
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.event.delete({
        where: {
          id: input.id,
        },
        select,
      })
    }),
})
