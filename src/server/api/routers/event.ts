import { z } from 'zod'
import { zonedTimeToUtc } from 'date-fns-tz'
import { getUnixTime } from 'date-fns'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const eventRouter = createTRPCRouter({
  range: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string() }))
    .query(({ ctx, input }) => {
      const unixStart = getUnixTime(
        zonedTimeToUtc(`${input.start}T00:00:00.0000Z`, 'UTC')
      )

      const unixEnd = getUnixTime(
        zonedTimeToUtc(`${input.end}T00:00:00.0000Z`, 'UTC')
      )

      return ctx.db.event.findMany({
        where: {
          createdById: ctx.session.user.id,
          OR: [
            {
              timestamp: {
                gte: unixStart,
                lt: unixEnd,
              },
            },
            {
              date: input.end,
            },
            {
              date: input.start,
            },
          ],
        },
        include: {
          category: true,
        },
        orderBy: {
          timestamp: 'asc',
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
        date: z.string(),
        time: z.string().optional(),
        categoryId: z.string().optional(),
        todo: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const timestamp = input.date
        ? getUnixTime(
            zonedTimeToUtc(
              `${input.date}T${input.time || '00:00:00.0000'}Z`,
              'UTC'
            )
          )
        : -1

      return ctx.db.event.create({
        data: {
          title: input.title,
          date: input.date,
          time: input.time,
          timestamp: timestamp,
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
        date: z.string(),
        time: z.string().nullable().optional(),
        categoryId: z.string().nullable().optional(),
        done: z.boolean().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const timestamp = input.date
        ? getUnixTime(
            zonedTimeToUtc(
              `${input.date}T${input.time || '00:00:00.0000'}Z`,
              'UTC'
            )
          )
        : -1

      return ctx.db.event.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          date: input.date,
          time: input.time,
          timestamp: timestamp,
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
