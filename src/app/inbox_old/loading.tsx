import { DayBoxSkeleton } from '~/components/skeleton/DayBox'
import { PageLayout } from '~/components/layout/PageLayout'

export default function Loading() {
  return (
    <PageLayout title="Inbox" skeleton fullscreen>
      <div className="grid h-full max-h-screen flex-grow grid-cols-2 gap-2 px-1 pb-2">
        {/* weekend */}
        <div className="grid grid-rows-2 gap-2">
          <DayBoxSkeleton />
          <DayBoxSkeleton />
        </div>
        {/* weekdays */}
        <div className="grid grid-rows-5 gap-2">
          <DayBoxSkeleton />
          <DayBoxSkeleton />
          <DayBoxSkeleton />
          <DayBoxSkeleton />
          <DayBoxSkeleton />
        </div>
      </div>
    </PageLayout>
  )
}
