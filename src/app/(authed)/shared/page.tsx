'use client'

import { endOfWeek, getDay, startOfDay } from 'date-fns'
import { RefreshIcon } from '~/components/RefreshIcon'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { SevenDays } from '~/components/seven-days/SevenDays'
import { Alert } from '~/components/ui/Alert'
import { Header1 } from '~/components/ui/headers'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'
import { createClientDateRangeHook } from '~/utils/hooks'
import { eventsByDay } from '~/utils/sort'

const useClientDate = createClientDateRangeHook({
  initialState: { start: new Date(), end: new Date() },
  processor: (date) => {
    return {
      start: startOfDay(date),
      end: endOfWeek(date, { weekStartsOn: getDay(date) }),
    }
  },
})

export default function SharedPage() {
  const [focusDate, focusMounted] = useClientDate()

  const queryClient = api.useUtils()

  const {
    data: events,
    isLoading,
    isFetching,
  } = api.event.sharedRange.useQuery(focusDate, {
    enabled: focusMounted,
    refetchInterval: Duration.minutes(2),
    select: eventsByDay,
  })

  const { data: followers } = api.follow.followers.useQuery()

  return (
    <InnerPageLayout
      fullscreen
      headerLeft={
        <RefreshIcon
          onClick={() => queryClient.event.sharedRange.invalidate()}
          loading={isFetching}
        />
      }
      title={
        <div className="relative z-10">
          <Header1 className="relative bg-neutral-950 text-2xl">Shared</Header1>
        </div>
      }
    >
      {followers && followers.length === 0 && (
        <Alert level="info" title="Shared" message="No followers yet" />
      )}
      {focusDate && (
        <SevenDays
          start={focusDate.start}
          end={focusDate.end}
          events={events}
          loading={isLoading}
          weekStart={getDay(focusDate.start)}
          usedIn="shared"
          outlines
        />
      )}
    </InnerPageLayout>
  )
}
