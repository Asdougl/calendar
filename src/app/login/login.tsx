'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'
import { Button } from '~/components/ui/button'
import { isError } from '~/utils/guards'
import { Alert } from '~/components/ui/Alert'
import { env } from '~/env.mjs'
import { cn } from '~/utils/classnames'

type SupportedProviders = 'discord' | 'github' | 'google'

export const Login = ({ signup }: { signup: boolean }) => {
  const [error, setError] = useState('')

  const signInWith = (provider: SupportedProviders) => () => {
    signIn(provider).catch((err) =>
      isError(err) ? setError(err.message) : setError('Unknown error')
    )
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-wide">
          {signup ? 'Sign up' : 'Sign in'}
        </h1>
        <p className="text-neutral-400">
          {signup
            ? 'Start your new calendar journey'
            : 'Continue your calendar journey'}
        </p>
      </div>
      <div className="flex max-w-md flex-col gap-4">
        <Button
          onClick={signInWith('discord')}
          className="flex items-center justify-center gap-2 bg-[#5865F2] lg:hover:bg-[#4E5BD1]"
        >
          <Image src="/discord-mark.svg" alt="Discord" width={20} height={20} />
          Continue with Discord
        </Button>
        <Button
          onClick={signInWith('github')}
          disabled={env.NEXT_PUBLIC_DEVELOPMENT}
          className="flex items-center justify-center gap-2 bg-[#24292F] lg:hover:bg-[#1B1F23]"
        >
          <Image
            src="/github-mark.svg"
            alt="Github"
            width={20}
            height={20}
            className={env.NEXT_PUBLIC_DEVELOPMENT ? 'opacity-75' : ''}
          />
          Continue with Github
        </Button>
        <Button
          onClick={signInWith('google')}
          className="flex items-center justify-center gap-2 bg-white text-[#1F1F1F] lg:hover:bg-[#F2F2F2]"
          disabled={env.NEXT_PUBLIC_DEVELOPMENT}
        >
          <Image
            src="/google-mark.svg"
            alt="Google"
            width={40}
            height={40}
            className={cn('-mx-[10px] -my-[20px]', {
              'opacity-75': env.NEXT_PUBLIC_DEVELOPMENT,
            })}
          />
          Continue with Google
        </Button>
      </div>
      <p className="text-neutral-400">
        Need another way to sign in?{' '}
        <a
          href="https://github.com/asdougl/calendar/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-300 underline hover:text-neutral-400"
        >
          Create an issue on github
        </a>
      </p>
      {error && (
        <Alert level="error" title="An error has occurred" message={error} />
      )}
    </div>
  )
}
