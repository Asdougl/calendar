import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { DayBoxSkeleton } from '~/components/skeleton/DayBox'
import { Navbar } from '~/components/Navbar'
import { Header1 } from '~/components/ui/headers'

export default function Loading() {
  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 py-6">
          <div className="w-8">
            <ArrowLeftIcon
              height={20}
              className="animate-pulse text-neutral-800"
            />
          </div>
          <div className="relative">
            <Header1 className="relative animate-pulse rounded-full bg-neutral-900 text-2xl text-transparent">
              Week of MMM dd
            </Header1>
          </div>
          <div className="relative w-8">
            <ArrowRightIcon
              height={20}
              className="animate-pulse text-neutral-800"
            />
          </div>
        </header>
        <div className="grid h-full max-h-screen grid-cols-2 gap-2 px-1 pb-2">
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
      </div>
      <Navbar loading />
    </main>
  )
}
