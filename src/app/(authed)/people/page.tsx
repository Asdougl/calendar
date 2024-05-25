'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { FollowRequests } from './requests'
import { Person } from '~/components/Person'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Button, SubmitButton } from '~/components/ui/button'
import { Header3 } from '~/components/ui/headers'
import { api } from '~/trpc/react'
import { warn } from '~/utils/logging'
import { PathLink } from '~/utils/nav/Link'

export default function PeoplePage() {
  const queryClient = api.useUtils()

  const followers = api.follow.followers.useQuery()
  const following = api.follow.following.useQuery()

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
    <InnerPageLayout
      headerLeft={
        <PathLink path="/profile" className="flex items-center justify-center">
          <ArrowLeftIcon height={20} className="" />
        </PathLink>
      }
      title="People"
    >
      <div className="flex flex-col overflow-y-auto px-4">
        <FollowRequests />
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Header3 className="pb-4">Following</Header3>
            <ul className="flex flex-col gap-2">
              {following.data && following.data.length > 0 ? (
                following.data.map((follow) => (
                  <li key={follow.id}>
                    <Person {...follow.following}>
                      {/* actions */}
                      {follow.status === 'PENDING' && (
                        <div className="text-xs text-neutral-400">
                          Pending...
                        </div>
                      )}
                      <Button
                        size="xs"
                        onClick={() =>
                          removeFollow.mutate({
                            userId: follow.following.id,
                          })
                        }
                      >
                        Unfollow
                      </Button>
                    </Person>
                  </li>
                ))
              ) : (
                <li>Not Following Anyone</li>
              )}
            </ul>
          </div>
          <div>
            <Header3 className="pb-4">Followers</Header3>
            <ul className="flex flex-col gap-2">
              {followers.data && followers.data.length > 0 ? (
                followers.data.map((follow) => (
                  <li key={follow.id}>
                    <Person {...follow.follower}>
                      {/* actions */}
                      {follow.follower.Followers.length === 0 && (
                        <SubmitButton
                          type="button"
                          size="xs"
                          onClick={() => {
                            createFollow.mutate({
                              userId: follow.follower.id,
                            })
                          }}
                          disabled={createFollow.isPending}
                          loading={createFollow.isPending}
                        >
                          Follow Back
                        </SubmitButton>
                      )}
                      <Button
                        size="xs"
                        onClick={() =>
                          removeFollow.mutate({
                            userId: follow.follower.id,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </Person>
                  </li>
                ))
              ) : (
                <li>No Followers</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </InnerPageLayout>
  )
}
