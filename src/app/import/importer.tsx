'use client'

import { TimeStatus } from '@prisma/client'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { api } from '~/trpc/react'

const importSchema = z.object({
  title: z.string(),
  datetime: z.string().transform((s) => new Date(s)),
  timeStatus: z.nativeEnum(TimeStatus),
  location: z.string().nullish(),
  categoryId: z.string().nullish(),
  done: z.boolean().nullish(),
  createdAt: z.string().transform((s) => new Date(s)),
  updatedAt: z.string().transform((s) => new Date(s)),
})

type Import = z.infer<typeof importSchema>

export const Importer = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [error, setError] = useState('')

  const { mutate, isLoading } = api.event.import.useMutation()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const json = textareaRef.current?.value

    if (!json) {
      return
    }

    const result = z.array(importSchema).safeParse(JSON.parse(json))

    if (result.success && result.data.length) {
      mutate(result.data)
    } else if (!result.success) {
      setError(result.error.message)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <button type="submit">Do it!</button>
      {isLoading && <p>Loading...</p>}
      <textarea
        ref={textareaRef}
        disabled={isLoading}
        placeholder="Paste JSON here"
        className="h-96 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950 p-1 placeholder:text-neutral-500"
      />
      {error && <p>{error}</p>}
    </form>
  )
}
