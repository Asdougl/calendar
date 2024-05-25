import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Header3 } from '~/components/ui/headers'
import { api } from '~/trpc/react'
import { warn } from '~/utils/logging'

export const FollowRequests = () => {
  const queryClient = api.useUtils()

  const { data: requests } = api.follow.requested.useQuery()

  const requestRespond = api.follow.respond.useMutation({
    onSuccess: () => {
      queryClient.follow.followers.invalidate().catch(warn)
      queryClient.follow.following.invalidate().catch(warn)
      queryClient.follow.requested.invalidate().catch(warn)
    },
  })
  return (
    requests &&
    requests.length > 0 && (
      <>
        <Header3 className="pb-4">Requests</Header3>
        <ul className="w-full pb-6">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex w-full flex-col items-center justify-between gap-4 rounded-lg border border-neutral-800 px-4 py-2 lg:flex-row"
            >
              <div className="flex w-full items-center gap-4">
                <Avatar
                  src={request.follower.image}
                  name={request.follower.name || request.follower.id}
                  size="lg"
                />
                <div className="flex grow flex-col text-lg lg:block">
                  <span className="font-bold">{request.follower.name}</span>{' '}
                  wants to follow you
                </div>
              </div>
              <div className="flex w-full gap-2 lg:justify-end">
                <Button
                  intent="primary"
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
    )
  )
}
