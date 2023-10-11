import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { setDay, startOfDay } from 'date-fns'
import { redirect } from 'next/navigation'
import { EventQuery } from './queries'
import { WeekView } from './week-view'
import type { Database } from '@/types/typegen'
import { Navbar } from '@/components/Navbar'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/login')
  }

  const today = startOfDay(new Date())

  const response = await supabase
    .from(EventQuery.from)
    .select(EventQuery.select)
    .gte('datetime', today.toISOString())
    .lt('datetime', setDay(today, 7).toISOString())

  if (response.error) {
    return <pre>An error has occurred</pre>
  }

  return (
    <main className="h-screen flex flex-col">
      <WeekView initialData={response.data} />
      <Navbar />
    </main>
  )
}
