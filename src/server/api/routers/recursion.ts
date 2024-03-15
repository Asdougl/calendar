import { z } from 'zod'
import { TIME_INVERVAL, TimeStatus } from '@prisma/client'
import { add } from 'date-fns'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TimeIntervalToDuration } from '~/utils/recursion'

const select = {
  id: true,
  title: true,
  interval: true,
  intervalCount: true,
  recurrenceEnd: true,
  triggered: true,
  datetime: true,
  timeStatus: true,
  location: true,
  todo: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
  events: {
    select: {
      id: true,
      datetime: true,
    },
  },
}

export const resursionRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.recursion.findMany({
      select,
      where: {
        createdById: ctx.session.user.id,
        events: {
          some: {
            datetime: {
              gte: new Date(),
            },
          },
        },
      },
    })
    return result.filter((recursion) => recursion.events.length > 0)
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        interval: z.nativeEnum(TIME_INVERVAL),
        intervalCount: z.number().int(),
        datetime: z.date(),
        timeStatus: z.nativeEnum(TimeStatus),
        location: z.string().optional(),
        todo: z.boolean().default(false),
        categoryId: z.string().optional(),
        triggered: z.boolean().default(false),
        recurrances: z.number().int().min(1).max(365),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create recursion
      const result = await ctx.db.recursion.create({
        data: {
          title: input.title,
          interval: input.interval,
          intervalCount: input.intervalCount,
          datetime: input.datetime,
          timeStatus: input.timeStatus,
          location: input.location,
          todo: input.todo,
          categoryId: input.categoryId,
          triggered: input.triggered,
          createdById: ctx.session.user.id,
        },
        select,
      })

      // Figure out how many events to create
      const eventsToCreate = Array(result.triggered ? 1 : input.recurrances)

      // Create relevant events
      const created = await ctx.db.event.createMany({
        data: eventsToCreate.map((_, index) => ({
          title: result.title,
          datetime: add(result.datetime, {
            [TimeIntervalToDuration[result.interval]]:
              index * result.intervalCount,
          }),
          timeStatus: result.timeStatus,
          location: result.location,
          categoryId: result.category?.id,
          createdById: ctx.session.user.id,
          done: result.todo ? false : null,
          recursionId: result.id,
        })),
      })

      // If the recursion is not triggered, we need to set the recurrenceEnd
      if (!result.triggered) {
        // Find the last event
        const lastEvent = await ctx.db.event.findFirst({
          where: {
            recursionId: result.id,
          },
          orderBy: {
            datetime: 'desc',
          },
        })

        if (lastEvent) {
          // Update the recursion with that datetime
          await ctx.db.recursion.update({
            where: {
              id: result.id,
            },
            data: {
              recurrenceEnd: lastEvent.datetime,
            },
          })

          // Note: this won't keep up with any changes on that event...

          return {
            recursion: result,
            count: created.count,
            recurrenceEnd: lastEvent.datetime,
          }
        }
      }

      return {
        recursion: result,
        count: created.count,
      }
    }),
})
