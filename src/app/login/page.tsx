import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Login } from './login'

export default async function LoginPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data } = await supabase.auth.getUser()

  if (data.user) {
    redirect('/')
  }

  return <Login />
}
