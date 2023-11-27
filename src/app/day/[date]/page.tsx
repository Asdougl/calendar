import { redirect } from 'next/navigation'
import { DateEvents } from './date-events'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { getServerAuthSession } from '~/server/auth'

type PathParams = {
  params: {
    date?: string
  }
}

const dateTest = /^\d{4}-\d{2}-\d{2}$/

export default async function DayDatePage({ params: { date } }: PathParams) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

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
