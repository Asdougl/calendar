import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Button } from '~/components/ui/button'

export default function DataPage() {
  return (
    <InnerPageLayout title="Your Data">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 px-4">
          <h3 className="text-lg font-semibold">Import Data</h3>
          <p>
            Import data from other calendar applications into your account. with
            an ICS file.
          </p>
          <textarea className="h-32 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 font-mono text-xs" />
          <Button>Upload</Button>
        </div>
        <div className="flex flex-col gap-2 px-4">
          <h3 className="text-lg font-semibold">Export Data</h3>
          <p>
            Download your data in a format that can be imported into other
            calendar applications.
          </p>
          <Button>Download</Button>
        </div>
      </div>
    </InnerPageLayout>
  )
}
