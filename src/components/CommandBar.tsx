'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { startOfWeek } from 'date-fns'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { ErrorText } from './ui/Text'
import { useMountEffect } from '~/utils/hooks'
import { toCalendarDate } from '~/utils/dates'

const COMMANDS = {
  SEARCH: 'search', // search for events by name
  GOTO: 'goto', // goto a specific week
  TODAY: 'today', // go to today
  INBOX: 'inbox', // go to inbox
  WEEK: 'week', // go to week
  MONTH: 'month', // go to month
  PROFILE: 'profile', // go to profile
  SETTINGS: 'settings', // go to profile
} as const
type Command = (typeof COMMANDS)[keyof typeof COMMANDS]

const COMMAND_DESCRIPTIONS = {
  [COMMANDS.SEARCH]: 'Search for events by name',
  [COMMANDS.GOTO]: 'Go to a specific week',
  [COMMANDS.TODAY]: 'Go to today',
  [COMMANDS.INBOX]: 'Go to inbox',
  [COMMANDS.WEEK]: 'Go to week',
  [COMMANDS.MONTH]: 'Go to month',
  [COMMANDS.PROFILE]: 'Go to profile',
  [COMMANDS.SETTINGS]: 'Go to settings',
} as const

export const CommandBar = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const [suggestions, setSuggestions] = useState<Command[]>([])

  const router = useRouter()

  const handleOpenChange = (open: boolean) => {
    setQuery('')
    if (open) {
      setOpen(true)
      setTimeout(() => {
        const input = document.getElementById('command-bar')
        if (input) {
          input.focus()
        }
      })
    } else {
      setOpen(false)
    }
  }

  useMountEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        e.preventDefault()
        handleOpenChange(true)
        if (e.shiftKey) {
          // Search
          setQuery('?')
        }
      } else if (e.key === 'Escape') {
        handleOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  })

  const updateQuery = (value: string) => {
    setQuery(value)
    setError('')
    setSuggestions(
      Object.values(COMMANDS).filter((command) =>
        command.toLowerCase().startsWith(value.toLowerCase())
      )
    )
  }

  const executeCommand = (e: FormEvent) => {
    e.preventDefault()
    const [commandName, ...args] = query.split(' ')

    if (!commandName) {
      return
    }

    switch (true) {
      case commandName.startsWith(COMMANDS.SEARCH): {
        if (!args.length) {
          setError('Missing search query')
          return
        }
        router.push('/events?q=' + args.join(' '))
        setOpen(false)
        return
      }
      case commandName.startsWith(COMMANDS.GOTO): {
        const dateString = args[0]
        if (dateString) {
          const date = new Date(dateString)
          if (!isNaN(date.getTime())) {
            router.push('/week?start=' + toCalendarDate(startOfWeek(date)))
            setOpen(false)
            return
          }
        }
        setError('Invalid date')
        return
      }
      case commandName.startsWith(COMMANDS.TODAY):
        router.push('/week')
        setOpen(false)
        return
      case commandName.startsWith(COMMANDS.INBOX):
        router.push('/inbox')
        setOpen(false)
        return
      case commandName.startsWith(COMMANDS.WEEK):
        router.push('/week')
        setOpen(false)
        return
      case commandName.startsWith(COMMANDS.MONTH):
        router.push('/month')
        setOpen(false)
        return
      case commandName.startsWith(COMMANDS.PROFILE):
        router.push('/profile')
        setOpen(false)
        return
      case commandName.startsWith(COMMANDS.SETTINGS):
        router.push('/profile')
        setOpen(false)
        return
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="container fixed left-1/2 top-10 z-10 max-w-lg -translate-x-1/2 p-6 lg:top-24">
          <form
            onSubmit={executeCommand}
            className="rounded-lg border border-neutral-800 bg-neutral-950"
          >
            <input
              type="text"
              id="command-bar"
              placeholder="Search or type a command"
              autoComplete="off"
              value={query}
              onChange={(e) => updateQuery(e.currentTarget.value)}
              className="w-full rounded-lg border-b border-neutral-800 bg-neutral-950 px-4 py-2 text-lg text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
            {query && (
              <ul>
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => setQuery(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                      >
                        {suggestion} - {COMMAND_DESCRIPTIONS[suggestion]}
                      </button>
                    </li>
                  ))
                ) : (
                  <li>
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    >
                      Clear
                    </button>
                  </li>
                )}
              </ul>
            )}
            {error && <ErrorText>{error}</ErrorText>}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
