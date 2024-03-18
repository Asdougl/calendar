import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const select = {
  id: true,
  name: true,
  color: true,
  private: true,
  hidden: true,
}

export const categoryRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      select,
      orderBy: {
        createdAt: 'asc',
      },
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
        select: {
          id: true,
          name: true,
          color: true,
          private: true,
          hidden: true,
        },
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
        private: z.boolean().optional(),
        hidden: z.boolean().optional(),
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
          private: input.private,
          hidden: input.hidden,
        },
        select,
      })
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // remove from all events
      await ctx.db.event.updateMany({
        where: {
          categoryId: input.id,
          createdById: ctx.session.user.id,
        },
        data: {
          categoryId: null,
        },
      })

      return ctx.db.category.delete({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        select,
      })
    }),
})
