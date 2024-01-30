import { z } from 'zod'
import { TimeStatus } from '@prisma/client'
import { addDays } from 'date-fns'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eventSort } from '~/utils/sort'

const select = {
  id: true,
  title: true,
  datetime: true,
  timeStatus: true,
  location: true,
  endDateTime: true,
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
    .input(z.object({ start: z.date(), end: z.date() }).optional())
    .query(({ ctx, input }) => {
      if (!input) return []

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
  progressive: protectedProcedure
    .input(z.object({ start: z.date(), cursor: z.number().nullish() }))
    .query(async ({ ctx, input }) => {
      const cursor = input.cursor ?? 0

      const items = await ctx.db.event.findMany({
        where: {
          createdById: ctx.session.user.id,
          OR: [
            {
              datetime: {
                gte: addDays(input.start, cursor).toISOString(),
                lt: addDays(input.start, cursor + 3).toISOString(),
              },
            },
          ],
        },
        select,
        orderBy: {
          datetime: 'asc',
        },
      })

      return {
        events: items.sort(eventSort),
        nextCursor: cursor + 3,
      }
    }),
  export: protectedProcedure.query(({ ctx }) => {
    return ctx.db.event.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
    })
  }),
  import: protectedProcedure
    .input(
      z.array(
        z.object({
          title: z.string(),
          datetime: z.date(),
          timeStatus: z.nativeEnum(TimeStatus),
          location: z.string().nullish(),
          categoryId: z.string().nullish(),
          done: z.boolean().nullish(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.event.createMany({
        data: input.map((event) => ({
          ...event,
          createdById: ctx.session.user.id,
        })),
      })
    }),
  upcoming: protectedProcedure
    .input(
      z.object({
        starting: z.date(),
        direction: z.enum(['before', 'after']).default('after'),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        query: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.event.findMany({
        where: {
          createdById: ctx.session.user.id,
          datetime:
            input.direction === 'after'
              ? {
                  gte: input.starting.toISOString(),
                }
              : {
                  lt: input.starting.toISOString(),
                },
          title: input.query
            ? {
                contains: input.query,
                mode: 'insensitive',
              }
            : undefined,
        },
        select,
        orderBy: {
          datetime: 'asc',
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: string | undefined = undefined
      if (items.length > input.limit) {
        const nextItem = items.pop()
        nextCursor = nextItem?.id ?? undefined
      }

      return {
        items,
        nextCursor,
      }
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
        categoryId: z.string().nullish(),
        location: z.string().nullish(),
        todo: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          title: input.title,
          datetime: input.datetime,
          timeStatus: input.timeStatus,
          location: input.location,
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
        location: z.string().nullish(),
        categoryId: z.string().nullish(),
        done: z.boolean().nullish(),
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
          location: input.location,
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
