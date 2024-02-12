import { PeriodsView } from './periods-view'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function PeriodsPage() {
  await isAuthed()

  return (
    <OuterPageLayout>
      <PeriodsView />
    </OuterPageLayout>
  )
}
