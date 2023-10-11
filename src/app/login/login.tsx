'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Header1 } from '@/components/headers'
import { Button } from '@/components/button'

export const Login = () => {
  const supabase = createClientComponentClient()

  const signInWithGithub = async () => {
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    })
  }

  return (
    <main className="container mx-auto pt-24 flex flex-col justify-center">
      <Header1 className="text-center">Login</Header1>
      <div className="flex flex-col gap-2 py-6">
        <Button onClick={signInWithGithub}>Login with Github</Button>
      </div>
    </main>
  )
}
