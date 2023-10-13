import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

  return (
    <main className="h-screen flex flex-col">
      <WeekView />
      <Navbar />
    </main>
  )
}
