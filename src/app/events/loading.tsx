import { SkeletonDivider, SkeletonEvent } from './skeleton'
import { PageLayout } from '~/components/layout/PageLayout'

export default function EventsLoading() {
  return (
    <PageLayout title="Events" skeleton>
      <ul className="flex flex-col gap-2">
        <SkeletonDivider />
        <SkeletonEvent />
        <SkeletonEvent />
        <SkeletonEvent />
        <SkeletonEvent />
        <SkeletonEvent />
        <SkeletonDivider />
        <SkeletonEvent />
        <SkeletonEvent />
        <SkeletonEvent />
      </ul>
    </PageLayout>
  )
}
