import { redirect } from 'next/navigation'
import { DateEvents } from './date-events'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

type PathParams = {
  params: {
    date?: string
  }
}

const dateTest = /^\d{4}-\d{2}-\d{2}$/

export default async function DayDatePage({ params: { date } }: PathParams) {
  await isAuthed()

  if (!date || !dateTest.test(date)) {
    redirect('/inbox')
  }

  const dateAsDate = new Date(date)

  if (isNaN(dateAsDate.getTime())) {
    redirect('/inbox')
  }

  return (
    <OuterPageLayout>
      <DateEvents date={dateAsDate} />
    </OuterPageLayout>
  )
}
