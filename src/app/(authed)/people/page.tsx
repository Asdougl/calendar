'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { Person } from '~/components/Person'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Avatar } from '~/components/ui/avatar'
import { Button, SubmitButton } from '~/components/ui/button'
import { Header3 } from '~/components/ui/headers'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { api } from '~/trpc/react'
import { useDebouncedState } from '~/utils/hooks'
import { warn } from '~/utils/logging'
import { PathLink } from '~/utils/nav/Link'

export default function PeoplePage() {
  const [value, setValue] = useDebouncedState('', 300)

  const queryClient = api.useUtils()

  const requests = api.follow.requested.useQuery()
  const followers = api.follow.followers.useQuery()
  const following = api.follow.following.useQuery()

  const userSearch = api.users.search.useQuery(
    {
      query: value,
    },
    { enabled: !!value }
  )

  const createFollow = api.follow.follow.useMutation({
    onSuccess: () => {
      queryClient.users.search.invalidate({ query: value }).catch(warn)
      queryClient.follow.followers.invalidate().catch(warn)
      queryClient.follow.following.invalidate().catch(warn)
    },
  })

  const removeFollow = api.follow.unfollow.useMutation({
    onSuccess: () => {
      queryClient.users.search.invalidate({ query: value }).catch(warn)
    },
  })

  const requestRespond = api.follow.respond.useMutation({
    onSuccess: () => {
      queryClient.follow.followers.invalidate().catch(warn)
      queryClient.follow.following.invalidate().catch(warn)
      queryClient.follow.requested.invalidate().catch(warn)
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
        <div className="py-6">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            defaultValue={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            width="full"
          />
        </div>
        {!value ? (
          <>
            {requests.data && requests.data.length > 0 && (
              <>
                <Header3 className="pb-4">Requests</Header3>
                <ul className="w-full pb-6">
                  {requests.data.map((request) => (
                    <li
                      key={request.id}
                      className="flex w-full flex-col items-center justify-between rounded-lg border border-neutral-800 px-4 py-2 lg:flex-row"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={request.follower.image}
                          name={request.follower.name || request.follower.id}
                          size="sm"
                        />
                        <div className="">
                          <span className="font-bold">
                            {request.follower.name}
                          </span>{' '}
                          wants to follow you
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            requestRespond.mutate({
                              followId: request.id,
                              status: 'ACCEPTED',
                            })
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => {
                            requestRespond.mutate({
                              followId: request.id,
                              status: 'REJECTED',
                            })
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Header3 className="pb-4">Following</Header3>
                <ul>
                  {following.data && following.data.length > 0 ? (
                    following.data.map((follow) => (
                      <li key={follow.id}>
                        <Person {...follow.following}>
                          {/* actions */}
                          {follow.status === 'PENDING' && <div>Pending</div>}
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
                <ul className="flex flex-col">
                  {followers.data && followers.data.length > 0 ? (
                    followers.data.map((follow) => (
                      <li key={follow.id}>
                        <Person {...follow.follower}>
                          {/* actions */}
                          {follow.follower.Followers.length === 0 && (
                            <SubmitButton
                              type="button"
                              size="sm"
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
          </>
        ) : (
          <div className="flex flex-col">
            {userSearch.data && (
              <p className="pb-4">
                {userSearch.data.length} result(s) for {value}
              </p>
            )}
            <ul>
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
        )}
      </div>
    </InnerPageLayout>
  )
}
