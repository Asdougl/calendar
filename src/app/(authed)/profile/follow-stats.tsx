'use client'

import { api } from '~/trpc/react'

export const FollowStats = () => {
  const followers = api.follow.followers.useQuery()
  const following = api.follow.following.useQuery()

  return (
    <div className="flex gap-4 rounded-lg border border-neutral-800 p-4">
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{followers.data?.length}</div>
        <div>Followers</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{following.data?.length}</div>
        <div>Following</div>
      </div>
    </div>
  )
}
