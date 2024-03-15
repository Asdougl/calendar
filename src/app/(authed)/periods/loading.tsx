import { PageLayout } from '~/components/layout/PageLayout'
import { SkeletonText } from '~/components/skeleton/Text'
import { Skeleton } from '~/components/skeleton/skeleton'
import { SkeletonButton } from '~/components/ui/button'

const dummyPeriods = [null, null, null, null]

export default function PeriodsLoading() {
  return (
    <PageLayout title="Periods" skeleton>
      <ul className="flex flex-col gap-2 pb-6">
        {dummyPeriods.map((_, index) => (
          <li
            key={index}
            className="flex gap-2 rounded-lg border border-neutral-800 px-2 py-2"
          >
            <div className="flex w-6 animate-pulse items-center justify-center rounded-lg bg-neutral-800">
              &nbsp;
            </div>
            <div className="flex flex-col">
              <SkeletonText className="text-lg">Loading Period</SkeletonText>
              <Skeleton isText className="flex gap-2">
                <span>25 Dec 1066 </span>
                <span>to</span>
                <span>1 Jan 1901</span>
                <span>(many days)</span>
              </Skeleton>
            </div>
            <div className="flex flex-grow justify-end">
              <SkeletonButton className="block">Edit</SkeletonButton>
            </div>
          </li>
        ))}
      </ul>
      <SkeletonButton>Create New</SkeletonButton>
    </PageLayout>
  )
}
