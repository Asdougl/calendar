'use client'

import { type FormEvent, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { isValid } from 'date-fns'
import { useMountEffect } from '~/utils/hooks'
import { createUpdatedSearchParams } from '~/utils/searchParams'

// split command into command and arguments respecting quotes
const splitCommand = (command: string) => {
  const parts = command.match(/"([^"]+)"|'([^']+)'|\S+/g)
  if (!parts) return []
  return parts.map((part) => part.replace(/"/g, '').replace(/'/g, ''))
}

export const CommandBar = () => {
  const [open, setOpen] = useState(false)
  const [commandString, setCommandString] = useState('')
  const [commandError, setCommandError] = useState('')

  const router = useRouter()

  const execCommand = (e: FormEvent) => {
    e.preventDefault()

    const [command, ...args] = splitCommand(commandString)

    if (command === 'event') {
      const url = createUpdatedSearchParams({
        update: { event: 'new', date: args[0], title: args[1] },
        remove: ['period'],
      })

      router.push(url)
      handleOpenChange(false)
    } else if (command === 'inbox') {
      router.push('/inbox')
      handleOpenChange(false)
    } else if (command === 'week') {
      const weekOf = args[0] ?? ''
      router.push(
        `/week${weekOf && isValid(new Date(weekOf)) ? `?of=${weekOf}` : ''}`
      )
      handleOpenChange(false)
    } else if (command === 'month') {
      const monthOf = args[0] ?? ''
      router.push(
        `/month${monthOf && isValid(new Date(monthOf)) ? `?of=${monthOf}` : ''}`
      )
      handleOpenChange(false)
    } else {
      setCommandError('Command not found')
    }
  }

  const handleOpenChange = (open: boolean) => {
    setCommandString('')
    if (open) {
      setOpen(true)
      setTimeout(() => {
        const input = document.getElementById('command-bar')
        if (input) {
          input.focus()
        }
      }, 1)
    } else {
      setOpen(false)
    }
  }

  useMountEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        e.preventDefault()
        handleOpenChange(true)
      } else if (e.key === 'Escape') {
        handleOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  })

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="container fixed left-1/2 top-10 z-10 max-w-lg -translate-x-1/2 p-6 lg:top-24">
          <form
            onSubmit={execCommand}
            className="rounded-lg border border-neutral-800 bg-neutral-950"
          >
            <input
              type="text"
              id="command-bar"
              placeholder="Search or type a command"
              autoComplete="off"
              value={commandString}
              onChange={(e) => setCommandString(e.currentTarget.value)}
              className="w-full rounded-lg border-b border-neutral-800 bg-neutral-950 px-4 py-2 font-mono text-lg text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
            {commandError && (
              <div className="p-2 text-sm text-red-500">{commandError}</div>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
