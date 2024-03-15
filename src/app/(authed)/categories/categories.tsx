'use client'

import { ListBulletIcon, PencilIcon } from '@heroicons/react/24/outline'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { api } from '~/trpc/react'
import { cn, color } from '~/utils/classnames'
import { Duration } from '~/utils/dates'
import { PathLink } from '~/utils/nav/Link'

export const Categories = () => {
  const { data: categories, isRefetching } = api.category.all.useQuery(
    undefined,
    {
      staleTime: Duration.minutes(10),
    }
  )

  return (
    <InnerPageLayout title="Categories">
      <ul className="flex flex-col gap-4">
        {categories?.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800"
          >
            <div className="flex items-center gap-2 px-4 py-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  color('bg')(category.color)
                )}
              ></div>
              {category.name}
              {category.private && (
                <div className="text-xs text-neutral-500">Private</div>
              )}
              {category.hidden && (
                <div className="text-xs text-neutral-500">Hidden</div>
              )}
            </div>
            <div className="flex h-full items-stretch gap-2">
              <PathLink
                path="/events"
                query={{ category: category.id }}
                className={cn(
                  'flex h-full items-center justify-center px-4 hover:bg-neutral-800',
                  isRefetching && 'pointer-events-none opacity-50'
                )}
              >
                <ListBulletIcon height={16} />
              </PathLink>
              <PathLink
                path="/categories/:categoryId"
                params={{ categoryId: category.id }}
                className={cn(
                  'flex h-full items-center justify-center px-4 hover:bg-neutral-800',
                  isRefetching && 'pointer-events-none opacity-50'
                )}
              >
                <PencilIcon height={16} />
              </PathLink>
            </div>
          </li>
        ))}
      </ul>
    </InnerPageLayout>
  )
}
