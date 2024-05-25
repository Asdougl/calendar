'use client'

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Avatar } from '~/components/ui/avatar'
import { SubmitButton } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { useDebouncedState } from '~/utils/hooks'
import { warn } from '~/utils/logging'

export default function SearchPeoplePage() {
  const [searchTerm, setSearchTerm, , originalValue] = useDebouncedState(
    '',
    200
  )

  const queryClient = api.useUtils()

  const userSearch = api.users.search.useQuery(
    {
      query: searchTerm,
    },
    { enabled: searchTerm.length > 2 }
  )

  const createFollow = api.follow.follow.useMutation({
    onSuccess: () => {
      queryClient.follow.followers.invalidate().catch(warn)
      queryClient.follow.following.invalidate().catch(warn)
    },
  })

  const removeFollow = api.follow.unfollow.useMutation({
    onSuccess: () => {
      queryClient.follow.followers.invalidate().catch(warn)
      queryClient.follow.following.invalidate().catch(warn)
    },
  })

  return (
    <>
      <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900">
        <label className="flex grow items-center">
          <div className="px-4 py-2">
            <MagnifyingGlassIcon height={20} className="text-neutral-600" />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="w-full bg-transparent px-4 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-0"
            autoComplete="off"
            placeholder="Search for people"
            value={originalValue}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
        </label>
        <button className="px-4 py-2" onClick={() => setSearchTerm('')}>
          <XMarkIcon height={20} className="text-neutral-600" />
        </button>
      </div>
      <div className="flex flex-col pt-6">
        {userSearch.data && (
          <div className="flex justify-end">
            <p className="px-2 pb-2 text-sm text-neutral-400">
              {userSearch.data.length}{' '}
              {userSearch.data.length > 1 ? 'results' : 'result'} for{' '}
              {searchTerm}
            </p>
          </div>
        )}
        <ul className="flex flex-col gap-2">
          {userSearch.data?.map((user) => (
            <li
              key={user.id}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-800 px-4 py-2"
            >
              <div className="flex items-center gap-4">
                <Avatar
                  src={user.image}
                  name={user.name || user.id}
                  size="sm"
                />
                {user.name}
              </div>
              {!user.Followers.length ? (
                <SubmitButton
                  type="button"
                  onClick={() => {
                    createFollow.mutate({ userId: user.id })
                  }}
                  disabled={createFollow.isPending}
                  loading={createFollow.isPending}
                >
                  Follow
                </SubmitButton>
              ) : (
                <SubmitButton
                  type="button"
                  onClick={() => removeFollow.mutate({ userId: user.id })}
                  disabled={removeFollow.isPending}
                  loading={removeFollow.isPending}
                >
                  Unfollow
                </SubmitButton>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
