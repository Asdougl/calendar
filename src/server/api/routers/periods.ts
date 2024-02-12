import { z } from 'zod'
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
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.period.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      select,
      orderBy: {
        startDate: 'asc',
      },
    })
  }),
  range: protectedProcedure
    .input(
      z
        .object({
          start: z.date(),
          end: z.date(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      if (!input) return []

      return ctx.db.period.findMany({
        where: {
          OR: [
            {
              // Start date in the range
              startDate: {
                gte: input.start,
                lte: input.end,
              },
            },
            {
              // End date in the range
              endDate: {
                gte: input.start,
                lte: input.end,
              },
            },
            {
              // start date before range and end date after range
              startDate: {
                lte: input.start,
              },
              endDate: {
                gte: input.end,
              },
            },
          ],
          createdById: ctx.session.user.id,
        },
        select,
        orderBy: {
          startDate: 'asc',
        },
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
      if (input.startDate > input.endDate)
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
        if (input.startDate > input.endDate)
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
          (input.startDate && input.startDate > existingPeriod.endDate) ||
          (input.endDate && input.endDate < existingPeriod.startDate)
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
