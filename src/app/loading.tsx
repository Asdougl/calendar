import { DayBoxSkeleton } from '~/components/skeleton/DayBox'
import { Navbar } from '~/components/Navbar'
import { Header1 } from '~/components/ui/headers'

export default function Loading() {
  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 py-6">
          <div className="w-8">
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-900"></div>
          </div>
          <div className="relative">
            <Header1 className="relative animate-pulse rounded-full bg-neutral-900 px-4 text-2xl text-transparent">
              Inbox
            </Header1>
          </div>
          <div className="relative w-8">
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-900"></div>
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
