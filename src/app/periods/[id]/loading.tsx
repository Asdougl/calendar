import { PageLayout } from '~/components/layout/PageLayout'
import { InputField } from '~/components/ui/Field'
import { SkeletonButton } from '~/components/ui/button'

export default function PeriodIdLoading() {
  return (
    <PageLayout title="Edit Period" skeleton>
      <div className="px-2">
        <InputField label="Name" skeleton />
        <InputField label="Color" skeleton />
        <InputField label="Icon" skeleton />
        <InputField label="Category" skeleton />
        <InputField label="Dates" skeleton />
        <div className="flex gap-4">
          <SkeletonButton>Save</SkeletonButton>
          <SkeletonButton>Delete</SkeletonButton>
        </div>
      </div>
    </PageLayout>
  )
}
