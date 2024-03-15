import { redirect } from 'next/navigation'
import { DateEvents } from './date-events'

type PathParams = {
  params: {
    date?: string
  }
}

const dateTest = /^\d{4}-\d{2}-\d{2}$/

export default function DayDatePage({ params: { date } }: PathParams) {
  if (!date || !dateTest.test(date)) {
    redirect('/inbox')
  }

  const dateAsDate = new Date(date)

  if (isNaN(dateAsDate.getTime())) {
    redirect('/inbox')
  }

  return <DateEvents date={dateAsDate} />
}
