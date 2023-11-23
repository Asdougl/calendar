'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Header1 } from '~/components/ui/headers'
import { Button } from '~/components/ui/button'
import { isError } from '~/utils/guards'
import { Alert } from '~/components/ui/Alert'

export const Login = () => {
  const [error, setError] = useState('')

  const signInWithDiscord = () => {
    signIn('discord').catch((err) =>
      isError(err) ? setError(err.message) : setError('Unknown error')
    )
  }
  const signInWithGithub = () => {
    signIn('github').catch((err) =>
      isError(err) ? setError(err.message) : setError('Unknown error')
    )
  }

  return (
    <main className="container mx-auto flex flex-col justify-center pt-24">
      <Header1 className="text-center">Login</Header1>
      <div className="flex flex-col gap-2 py-6">
        <Button onClick={signInWithDiscord}>Login with Discord</Button>
        <Button onClick={signInWithGithub}>Login with Github</Button>
      </div>
      {error && (
        <Alert level="error" title="An error has occurred" message={error} />
      )}
    </main>
  )
}
