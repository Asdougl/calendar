import { InnerPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function Page() {
  await isAuthed()

  return (
    <InnerPageLayout title="Recursion">
      <p>View all Recursions</p>
    </InnerPageLayout>
  )
}
