import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { DayBoxSkeleton } from '~/components/skeleton/DayBox'
import { Header1 } from '~/components/ui/headers'
import { PageLayout } from '~/components/layout/PageLayout'

export default function Loading() {
  return (
    <PageLayout
      headerLeft={
        <ArrowLeftIcon height={20} className="animate-pulse text-neutral-800" />
      }
      title={
        <Header1 className="relative animate-pulse rounded-full bg-neutral-900 text-2xl text-transparent">
          Week of MMM dd
        </Header1>
      }
      headerRight={
        <ArrowRightIcon
          height={20}
          className="animate-pulse text-neutral-800"
        />
      }
      skeleton
      fullscreen
    >
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
