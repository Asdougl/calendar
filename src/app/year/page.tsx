import { PageLayout } from '~/components/layout/PageLayout'
import { Paragraph } from '~/components/ui/paragraph'
import { isAuthed } from '~/utils/auth'

export default async function Year() {
  await isAuthed()

  return (
    <PageLayout title="Year View">
      <Paragraph>Coming soon...</Paragraph>
    </PageLayout>
  )
}
