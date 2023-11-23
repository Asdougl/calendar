'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { isError } from '~/utils/guards'
import { Alert } from '~/components/ui/Alert'
import { Header2 } from '~/components/ui/headers'

export const Login = ({ signup }: { signup: boolean }) => {
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
    <div className="flex flex-col gap-4 py-16">
      <div>
        <Header2 className="text-center">
          {signup ? 'Sign up' : 'Log in'}
        </Header2>
        {signup && (
          <div className="text-center text-neutral-400">
            Start your new calendar journey
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={signInWithDiscord}>Continue with Discord</Button>
        <Button onClick={signInWithGithub}>Continue with Github</Button>
      </div>
      {error && (
        <Alert level="error" title="An error has occurred" message={error} />
      )}
    </div>
  )
}
