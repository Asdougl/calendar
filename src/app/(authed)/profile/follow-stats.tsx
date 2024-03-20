'use client'

import { api } from '~/trpc/react'

export const FollowStats = () => {
  const followers = api.follow.followers.useQuery()
  const following = api.follow.following.useQuery()

  return (
    <div className="flex gap-4 rounded-lg border border-neutral-800 px-4 py-2">
      <div className="flex items-center gap-2">
        <div>Followers</div>
        <div className="font-bold">{followers.data?.length}</div>
      </div>
      <div className="flex items-center gap-2">
        <div>Following</div>
        <div className="font-bold">{following.data?.length}</div>
      </div>
    </div>
  )
}
