import { InnerPageLayout } from '~/components/layout/PageLayout'
import { createRandomArray } from '~/utils/misc'

const FakeDayOfWeek = ({ rows }: { rows: 2 | 5 }) => (
  <div
    className={`flex flex-col rounded-lg border border-neutral-800 ${
      rows === 5 ? 'row-span-5' : 'row-span-2'
    }`}
  >
    <div className="px-0.5 pt-0.5 md:px-2 md:pt-2">
      <div className="animate-pulse rounded-full bg-neutral-800 text-xs text-transparent">
        Day of Week
      </div>
    </div>
    <div className="flex flex-col px-0.5 text-sm md:gap-0.5 md:px-2">
      {createRandomArray(0, 3, null).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-neutral-800 py-1"
        >
          <div className="animate-pulse rounded-full bg-neutral-800 text-transparent">
            Event
          </div>
          <div className="animate-pulse rounded-full bg-neutral-800 text-transparent">
            00:00 am
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function InboxLoader() {
  return (
    <InnerPageLayout
      title={
        <h1 className="animate-pulse rounded-full bg-neutral-800 px-2 text-3xl font-bold text-transparent">
          Inbox
        </h1>
      }
    >
      <div className="grid h-full grid-cols-2 grid-rows-10 gap-1">
        <FakeDayOfWeek rows={5} />
        <FakeDayOfWeek rows={2} />
        <FakeDayOfWeek rows={2} />
        <FakeDayOfWeek rows={2} />
        <FakeDayOfWeek rows={5} />
        <FakeDayOfWeek rows={2} />
        <FakeDayOfWeek rows={2} />
      </div>
    </InnerPageLayout>
  )
}
