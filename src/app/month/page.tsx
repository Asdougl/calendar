import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/typegen'
import { Navbar } from '@/components/Navbar'
import { Header1 } from '@/components/headers'
import { Paragraph } from '@/components/paragraph'

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
      <div className="flex-grow flex flex-col items-center pt-16">
        <Header1>Month View</Header1>
        <Paragraph>Coming soon...</Paragraph>
      </div>
      <Navbar />
    </main>
  )
}
