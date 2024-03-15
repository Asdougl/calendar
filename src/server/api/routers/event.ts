import { z } from 'zod'
import { EVENT_LINK_RELATION, TimeStatus } from '@prisma/client'
import { add, addDays } from 'date-fns'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eventSort } from '~/utils/sort'
import { TimeIntervalToDuration } from '~/utils/recursion'

const select = {
  id: true,
  title: true,
  datetime: true,
  timeStatus: true,
  location: true,
  endDateTime: true,
  done: true,
  cancelled: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
  recursion: {
    select: {
      id: true,
      interval: true,
      intervalCount: true,
      triggered: true,
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
          datetime: {
            gte: input.start.toISOString(),
            lt: input.end.toISOString(),
          },
          OR: [
            {
              category: {
                NOT: {
                  hidden: true,
                },
              },
            },
            {
              category: null,
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
  upcoming: protectedProcedure
    .input(
      z.object({
        starting: z.date(),
        direction: z.enum(['before', 'after']).default('after'),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        query: z.string().nullish(),
        category: z.string().nullish(),
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
              }
            : undefined,
          categoryId: input.category ?? undefined,
          // filter out hidden UNLESS we're looking for a specific category
          category: input.category
            ? {
                NOT: {
                  hidden: true,
                },
              }
            : undefined,
        },
        select,
        orderBy: {
          datetime: input.direction === 'after' ? 'asc' : 'desc',
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
        done: z.boolean().nullish(),
        cancelled: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      // if time status is all day, set the time to 12:00
      if (
        input.timeStatus &&
        (input.timeStatus === TimeStatus.ALL_DAY ||
          input.timeStatus === TimeStatus.NO_TIME)
      ) {
        input.datetime = new Date(input.datetime.setHours(12, 0, 0, 0))
      }

      return ctx.db.event.create({
        data: {
          title: input.title,
          datetime: input.datetime,
          timeStatus: input.timeStatus,
          location: input.location,
          categoryId: input.categoryId,
          createdById: ctx.session.user.id,
          done: input.done,
          cancelled: input.cancelled,
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
        cancelled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // if time status is all day, set the time to 12:00
      if (
        input.timeStatus &&
        (input.timeStatus === TimeStatus.ALL_DAY ||
          input.timeStatus === TimeStatus.NO_TIME)
      ) {
        if (input.datetime) {
          input.datetime = new Date(input.datetime.setHours(12, 0, 0, 0))
        } else {
          // fuck we need to query it :(
          const event = await ctx.db.event.findUnique({
            select: { datetime: true },
            where: { id: input.id },
          })
          if (!event) return null
          input.datetime = new Date(event.datetime.setHours(12, 0, 0, 0))
        }
      }

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
          cancelled: input.cancelled,
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
  complete: protectedProcedure
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Update the original event
      const event = await ctx.db.event.update({
        where: {
          id: input.id,
        },
        data: {
          done: input.completed,
        },
        select: {
          ...select,
          recursion: {
            select: {
              id: true,
              title: true,
              interval: true,
              intervalCount: true,
              datetime: true,
              timeStatus: true,
              location: true,
              triggered: true,
              todo: true,
              categoryId: true,
            },
          },
          SourceLink: {
            select: {
              id: true,
              relation: true,
              targetId: true,
            },
          },
        },
      })

      if (event.recursion?.triggered) {
        // Check if the event has
        const hasTriggeredEvent = event.SourceLink?.some(
          (link) => link.relation === EVENT_LINK_RELATION.TRIGGERED
        )

        // If the event has not been triggered, create a new event
        if (!hasTriggeredEvent) {
          // Create the triggered event
          const createdEvent = await ctx.db.event.create({
            data: {
              title: event.recursion.title,
              datetime: add(event.datetime, {
                [TimeIntervalToDuration[event.recursion.interval]]:
                  event.recursion.intervalCount,
              }),
              timeStatus: event.recursion.timeStatus,
              location: event.recursion.location,
              categoryId: event.recursion.categoryId,
              createdById: ctx.session.user.id,
              done: event.recursion.todo ? false : null,
              recursionId: event.recursion.id,
            },
          })

          // Create the link
          await ctx.db.eventLink.create({
            data: {
              relation: EVENT_LINK_RELATION.TRIGGERED,
              sourceId: event.id,
              targetId: createdEvent.id,
            },
          })

          // Return the event and the triggered event
          return {
            event,
            triggered: createdEvent,
          }
        }
      }

      // Return just the event
      return {
        event,
      }
    }),
})
