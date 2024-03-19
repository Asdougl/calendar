import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const select = {
  id: true,
  name: true,
  color: true,
  private: true,
  hidden: true,
}

const extendedSelect = {
  ...select,
  CategoryShare: {
    select: {
      id: true,
      sharedWith: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
}

export const categoryRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      select: extendedSelect,
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
        select: extendedSelect,
      })
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.string(),
        private: z.boolean().optional(),
        hidden: z.boolean().optional(),
        shareIds: z.array(z.string()).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.$transaction(async (db) => {
        const category = await db.category.create({
          data: {
            name: input.name,
            color: input.color,
            createdById: ctx.session.user.id,
          },
          select: extendedSelect,
        })

        if (!input.shareIds || input.shareIds.length === 0) {
          return category
        }

        const potentialShares = await db.follow.findMany({
          where: {
            followerId: ctx.session.user.id,
            followingId: {
              in: input.shareIds,
            },
            status: 'ACCEPTED',
          },
          select: {
            id: true,
            followingId: true,
          },
        })

        if (potentialShares.length === 0) {
          return category
        }

        const shares = await db.categoryShare.createMany({
          data: potentialShares.map((share) => ({
            categoryId: category.id,
            sharedWidthId: share.followingId,
          })),
        })

        return {
          ...category,
          CategoryShare:
            shares.count > 0
              ? await db.categoryShare.findMany({
                  where: {
                    categoryId: category.id,
                  },
                  select: {
                    ...extendedSelect.CategoryShare.select,
                  },
                })
              : [],
        }
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
        shareIds: z.array(z.string()).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.$transaction(async (db) => {
        // update the category
        const category = await db.category.update({
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
          select: extendedSelect,
        })

        if (!input.shareIds) {
          // if no shareIds, just return the category
          return category
        }

        // Get All current shares
        const currentShares = await db.categoryShare.findMany({
          where: {
            categoryId: input.id,
          },
          select: {
            sharedWidthId: true,
          },
        })

        // if not shared and no shares to add, just return the category
        if (input.shareIds.length === 0 && currentShares.length === 0) {
          return category
        }

        const potentialShares = await db.follow.findMany({
          where: {
            followerId: ctx.session.user.id,
            followingId: {
              in: input.shareIds,
            },
            status: 'ACCEPTED',
          },
          select: {
            id: true,
            followingId: true,
          },
        })

        // determine what shares to remove
        const toRemove = currentShares.filter(
          (share) => !input.shareIds?.includes(share.sharedWidthId)
        )

        // determine what shares to add
        const toAdd = potentialShares
          .map((share) => share.followingId)
          .filter(
            (id) => !currentShares.some((share) => share.sharedWidthId === id)
          )

        if (toRemove.length > 0) {
          // remove shares
          await db.categoryShare.deleteMany({
            where: {
              categoryId: input.id,
              sharedWidthId: {
                in: toRemove.map((share) => share.sharedWidthId),
              },
            },
          })
        }
        if (toAdd.length > 0) {
          // add new shares
          await db.categoryShare.createMany({
            data: toAdd.map((id) => ({
              categoryId: input.id,
              sharedWidthId: id,
            })),
          })
        }

        return {
          ...category,
          CategoryShare: await db.categoryShare.findMany({
            where: {
              categoryId: category.id,
            },
            select: {
              ...extendedSelect.CategoryShare.select,
            },
          }),
        }
      })
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // check you own this cateogyr!
      const category = await ctx.db.category.findUnique({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        select: {
          id: true,
        },
      })

      if (!category) {
        throw new Error('Category not found')
      }

      // remove from all events
      await Promise.all([
        ctx.db.event.updateMany({
          where: {
            categoryId: category.id,
            createdById: ctx.session.user.id,
          },
          data: {
            categoryId: null,
          },
        }),
        ctx.db.categoryShare.deleteMany({
          where: {
            categoryId: category.id,
          },
        }),
      ])

      return ctx.db.category.delete({
        where: {
          id: category.id,
          createdById: ctx.session.user.id,
        },
        select,
      })
    }),
  shares: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.categoryShare.findMany({
        where: {
          category: {
            id: input.categoryId,
            createdById: ctx.session.user.id,
          },
        },
        select: {
          sharedWith: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })
    }),
  share: protectedProcedure
    .input(z.object({ userId: z.string(), categoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.categoryId,
          createdById: ctx.session.user.id,
        },
      })

      if (!category) {
        throw new Error('Category not found')
      }

      const user = await ctx.db.follow.findFirst({
        where: {
          followerId: ctx.session.user.id,
          followingId: input.userId,
          status: 'ACCEPTED',
        },
        select: {
          id: true,
          following: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return ctx.db.category.update({
        where: {
          id: input.categoryId,
        },
        data: {
          CategoryShare: {
            connectOrCreate: {
              where: {
                sharedWidthId_categoryId: {
                  categoryId: input.categoryId,
                  sharedWidthId: input.userId,
                },
              },
              create: {
                sharedWidthId: input.userId,
              },
            },
          },
        },
        select,
      })
    }),
  unshare: protectedProcedure
    .input(z.object({ userId: z.string(), categoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: {
          id: input.categoryId,
        },
        data: {
          CategoryShare: {
            delete: {
              sharedWidthId_categoryId: {
                categoryId: input.categoryId,
                sharedWidthId: input.userId,
              },
            },
          },
        },
        select,
      })
    }),
})
