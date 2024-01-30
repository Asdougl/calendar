import { NextSevenDays } from './seven-days'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function InboxPage() {
  await isAuthed()

  return (
    <OuterPageLayout fullscreen>
      <NextSevenDays />
    </OuterPageLayout>
  )
}
