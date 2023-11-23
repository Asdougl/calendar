'use client'

import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { TimezoneSelect } from '~/components/form/TimezoneSelect'
import { SettingItem, SettingList } from '~/components/layout/Settings'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { api } from '~/trpc/react'
import { Preferences } from '~/types/preferences'
import { useClientNow, useClientTimezone } from '~/utils/hooks'

export const PreferencesSection = () => {
  const queryClient = api.useContext()
  const [initialUpdate, setInitialUpdate] = useState(false)

  const { data: preferences, isInitialLoading } =
    api.preferences.getAll.useQuery()
  const { mutate: updatePreferences, isLoading: isUpdating } =
    api.preferences.update.useMutation({
      onMutate: async (data) => {
        if (!initialUpdate) {
          setInitialUpdate(true)
        }
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.preferences.getAll.cancel()
        // Snapshot the previous value
        const old = queryClient.preferences.getAll.getData()
        // Optimistically update to the new value
        queryClient.preferences.getAll.setData(
          undefined,
          Preferences.parse({
            ...old,
            ...data,
          })
        )
        // Return a context object with the snapshotted value
        return { prevData: old }
      },
      onError: (err, newPrefs, ctx) => {
        if (ctx?.prevData) {
          // If the mutation fails, use the context returned from onMutate to roll back
          queryClient.preferences.getAll.setData(undefined, ctx.prevData)
        }
      },
      onSettled: () => {
        // Invalidate and refetch
        // eslint-disable-next-line no-console
        queryClient.preferences.getAll.invalidate().catch(console.error)
      },
    })

  return (
    <SettingList
      title="Preferences"
      saving={initialUpdate ? (isUpdating ? true : false) : undefined}
    >
      <SettingItem title="Weekends left" skeleton={isInitialLoading}>
        {preferences && (
          <Switch
            checked={preferences.leftWeekends}
            disabled={isInitialLoading || isUpdating}
            onClick={() =>
              updatePreferences({
                ...preferences,
                leftWeekends: !preferences.leftWeekends,
              })
            }
          />
        )}
      </SettingItem>
      <SettingItem title="Timezone" skeleton={isInitialLoading}>
        {preferences && (
          <TimezoneSelect
            value={preferences.timezone}
            disabled={isInitialLoading || isUpdating}
            onChange={(value) =>
              updatePreferences({ ...preferences, timezone: value })
            }
            className="h-full rounded-none border-0"
          />
        )}
      </SettingItem>
      <SettingItem title="Logout">
        <Button
          onClick={() => signOut()}
          size="sm"
          intent="secondary"
          className="w-40"
        >
          Logout
        </Button>
      </SettingItem>
      <SettingItem title="Developer" skeleton={isInitialLoading}>
        {preferences && (
          <Switch
            checked={preferences.developer}
            disabled={isInitialLoading || isUpdating}
            onClick={() =>
              updatePreferences({
                ...preferences,
                developer: !preferences.developer,
              })
            }
          />
        )}
      </SettingItem>
    </SettingList>
  )
}

export const DebugSection = () => {
  const [time, setTime] = useClientNow()

  const { data: preferences } = api.preferences.getAll.useQuery()

  const queryClient = api.useContext()

  const timezone = useClientTimezone()

  return preferences?.developer ? (
    <SettingList title="Developer">
      <SettingItem title="Machine time">
        <div className="pr-2">{time.toLocaleString()}</div>
        <button onClick={() => setTime(new Date())}>
          <ArrowPathIcon height={16} />
        </button>
      </SettingItem>
      <SettingItem title="Timezone">{timezone || 'Unknown'}</SettingItem>
      <SettingItem title="Invalidate Cache">
        <Button
          size="sm"
          intent="secondary"
          className="w-40"
          // eslint-disable-next-line no-console
          onClick={() => queryClient.invalidate().catch(console.error)}
        >
          Clear
        </Button>
      </SettingItem>
      <SettingItem title="Force Refresh">
        <Button
          onClick={() => location.reload()}
          size="sm"
          intent="secondary"
          className="w-40"
        >
          Reload
        </Button>
      </SettingItem>
    </SettingList>
  ) : null
}
