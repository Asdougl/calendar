import { z } from 'zod'
import { isAfter } from 'date-fns'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const select = {
  id: true,
  name: true,
  color: true,
  icon: true,
  startDate: true,
  endDate: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
}

export const periodsRouter = createTRPCRouter({
  range: protectedProcedure
    .input(
      z.object({
        start: z.date(),
        end: z.date(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.period.findMany({
        where: {
          OR: [
            {
              endDate: {
                gte: input.start,
              },
            },
            {
              startDate: {
                lte: input.end,
              },
            },
          ],
          createdById: ctx.session.user.id,
        },
        select,
      })
    }),

  one: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.period.findUnique({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        select: {
          ...select,
          categoryId: true,
        },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.string(),
        icon: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        categoryId: z.string().nullish(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!isAfter(input.endDate, input.startDate))
        throw new Error('End date must be after start date')

      return ctx.db.period.create({
        data: {
          name: input.name,
          color: input.color,
          icon: input.icon,
          startDate: input.startDate,
          endDate: input.endDate,
          createdById: ctx.session.user.id,
          categoryId: input.categoryId,
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
        icon: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        categoryId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.startDate && input.endDate) {
        if (!isAfter(input.endDate, input.startDate))
          throw new Error('End date must be after start date')

        return ctx.db.period.update({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
          data: {
            name: input.name,
            color: input.color,
            icon: input.icon,
            startDate: input.startDate,
            endDate: input.endDate,
            categoryId: input.categoryId,
          },
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            startDate: true,
            endDate: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        })
      } else if (input.startDate || input.endDate) {
        // only have start date, need to compare to existing end date
        const existingPeriod = await ctx.db.period.findUnique({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
        })

        if (!existingPeriod) throw new Error('Period not found')

        if (
          (input.startDate &&
            !isAfter(existingPeriod.endDate, input.startDate)) ||
          (input.endDate && !isAfter(input.endDate, existingPeriod.startDate))
        ) {
          throw new Error('End date must be after start date')
        }

        return ctx.db.period.update({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
          data: {
            name: input.name,
            color: input.color,
            icon: input.icon,
            startDate: input.startDate,
          },
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            startDate: true,
            endDate: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        })
      } else {
        return ctx.db.period.update({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
          data: {
            name: input.name,
            color: input.color,
            icon: input.icon,
          },
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            startDate: true,
            endDate: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        })
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.period.delete({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        select,
      })
    }),
})
