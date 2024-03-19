import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const select = {
  id: true,
  name: true,
  image: true,
}

export const followRouter = createTRPCRouter({
  followers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.follow.findMany({
      where: {
        followingId: ctx.session.user.id,
        status: 'ACCEPTED',
      },
      select: {
        id: true,
        status: true,
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            Followers: {
              where: {
                followerId: ctx.session.user.id,
              },
            },
          },
        },
      },
    })
  }),
  following: protectedProcedure
    .input(z.object({ status: z.enum(['ACCEPTED', 'PENDING']) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.follow.findMany({
        where: {
          followerId: ctx.session.user.id,
          status: !input
            ? {
                in: ['ACCEPTED', 'PENDING'],
              }
            : input.status,
        },
        select: {
          id: true,
          status: true,
          following: {
            select,
          },
        },
      })
    }),
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentFollow = await ctx.db.follow.findFirst({
        where: {
          followerId: ctx.session.user.id,
          followingId: input.userId,
        },
      })

      if (currentFollow) return currentFollow

      return ctx.db.follow.create({
        data: {
          followerId: ctx.session.user.id,
          followingId: input.userId,
        },
        select: {
          following: {
            select,
          },
        },
      })
    }),
  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const returned = await ctx.db.follow.deleteMany({
        where: {
          OR: [
            {
              followerId: ctx.session.user.id,
              followingId: input.userId,
            },
            {
              followerId: input.userId,
              followingId: ctx.session.user.id,
            },
          ],
        },
      })

      if (returned.count) {
        await ctx.db.categoryShare.deleteMany({
          where: {
            OR: [
              {
                sharedWidthId: ctx.session.user.id,
                category: {
                  createdById: input.userId,
                },
              },
              {
                sharedWidthId: input.userId,
                category: {
                  createdById: ctx.session.user.id,
                },
              },
            ],
          },
        })
      }

      return returned.count
    }),
  requested: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.follow.findMany({
      where: {
        followingId: ctx.session.user.id,
        status: 'PENDING',
      },
      select: {
        id: true,
        follower: {
          select,
        },
      },
    })
  }),
  respond: protectedProcedure
    .input(
      z.object({
        followId: z.string(),
        status: z.enum(['ACCEPTED', 'REJECTED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.follow.update({
        where: {
          id: input.followId,
          followingId: ctx.session.user.id,
        },
        data: {
          status: input.status,
        },
      })
    }),
})
