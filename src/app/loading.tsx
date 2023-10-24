import { Navbar } from '~/components/Navbar'
import { Header1 } from '~/components/ui/headers'

const DayBoxSkeleton = () => {
  return (
    <div className="flex-grow rounded-lg border border-neutral-800 px-2 py-1">
      <div className="flex justify-between">
        <div className="flex items-baseline gap-1">
          <span className="my-2 h-4 w-12 animate-pulse rounded-full bg-neutral-900"></span>
        </div>
      </div>
      <ul className="flex flex-col gap-1 py-1">
        <li className="my-2 h-4 w-3/4 animate-pulse rounded-full bg-neutral-900"></li>
      </ul>
    </div>
  )
}

export default function Loading() {
  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 py-6">
          <div className="w-8"></div>
          <div className="relative">
            <Header1 className="bg-neutral-950 text-2xl">
              <div className="h-[1em] w-12 animate-pulse rounded-full bg-neutral-900"></div>
            </Header1>
          </div>
          <div className="relative w-8"></div>
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
