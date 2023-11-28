import { MonthView } from './month-view'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function Home() {
  await isAuthed()

  return (
    <OuterPageLayout fullscreen>
      <MonthView />
    </OuterPageLayout>
  )
}
