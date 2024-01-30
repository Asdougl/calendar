import { Exporter } from './exporter'
import { PageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function ExportPage() {
  await isAuthed()

  return (
    <PageLayout title="Export">
      <Exporter />
    </PageLayout>
  )
}
