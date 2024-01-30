import { Importer } from './importer'
import { PageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function ImportPage() {
  await isAuthed()

  return (
    <PageLayout title="Import">
      <Importer />
    </PageLayout>
  )
}
