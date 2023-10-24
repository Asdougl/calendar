import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { Navbar } from '~/components/Navbar'
import { SkeletonText } from '~/components/skeleton/Text'
import { Header1 } from '~/components/ui/headers'
import { cn } from '~/utils/classnames'

const PLACEHOLDER_WEEKS = [
  Array(6).fill(null),
  Array(6).fill(null),
  Array(6).fill(null),
  Array(6).fill(null),
]

export default function MonthView() {
  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-grow flex-col">
        <header className="flex items-center justify-between px-4 py-6">
          <div className="w-8"></div>
          <Header1 className="text-2xl">
            <SkeletonText>November 2000</SkeletonText>
          </Header1>
          <div className="w-8"></div>
        </header>
        <div className="flex w-full items-center justify-center rounded-lg py-2">
          <ChevronUpIcon
            height={24}
            className="animate-pulse text-neutral-800"
          />
        </div>
        <div className="flex flex-grow flex-col gap-[2px] overflow-scroll px-[2px]">
          {PLACEHOLDER_WEEKS.map((week, i) => (
            <div key={i} className="group flex flex-1 flex-grow">
              {week.map((day, j) => {
                return (
                  <div
                    key={j}
                    className={cn(
                      'group flex-1 flex-grow overflow-hidden border border-r-0 border-neutral-800 px-[2px] py-[2px] first:rounded-l-lg last:rounded-r-lg last:border-r',
                      j > 4 && 'bg-neutral-900'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="relative text-xs text-transparent">
                        Mon 00
                        <div className="absolute left-0 top-0 animate-pulse rounded-full bg-neutral-800"></div>
                      </div>
                    </div>
                    <div className="px-2 pt-1">
                      <div className="h-3 w-full animate-pulse rounded-full bg-neutral-800"></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex w-full items-center justify-center rounded-lg py-2">
          <ChevronDownIcon
            height={24}
            className="animate-pulse text-neutral-800"
          />
        </div>
      </div>
      <Navbar loading />
    </main>
  )
}
