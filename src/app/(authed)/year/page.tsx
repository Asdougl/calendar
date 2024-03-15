import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Paragraph } from '~/components/ui/paragraph'
import { isAuthed } from '~/utils/auth'

export default async function Year() {
  await isAuthed()

  return (
    <InnerPageLayout title="Year View">
      <Paragraph>Coming soon...</Paragraph>
    </InnerPageLayout>
  )
}
