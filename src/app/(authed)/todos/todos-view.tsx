'use client'

import { CheckIcon } from '@heroicons/react/24/solid'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useState } from 'react'
import { Alert } from '~/components/ui/Alert'
import { Button } from '~/components/ui/button'
import { Header1 } from '~/components/ui/headers'
import { api } from '~/trpc/react'
import { time } from '~/utils/dates'

export const TodosView = () => {
  const [showDone, setShowDone] = useState(false)

  const queryClient = api.useUtils()

  const { data: todos } = api.event.todos.useQuery(
    { done: showDone },
    {
      staleTime: time.minutes(2),
      refetchInterval: time.minutes(5),
    }
  )

  const { mutate, isPending, error } = api.event.update.useMutation({
    onMutate: ({ id, done }) => {
      const previousTodos = queryClient.event.todos.getData({ done: showDone })
      if (previousTodos && done !== undefined) {
        queryClient.event.todos.setData(
          { done: showDone },
          previousTodos.map((todo) => {
            if (todo.id === id) {
              return {
                ...todo,
                done,
              }
            }
            return todo
          })
        )
      }
    },
    onSuccess: () => {
      // eslint-disable-next-line no-console
      queryClient.event.todos.invalidate().catch(console.warn)
    },
  })

  const toggleShowDone = () => {
    setShowDone((curr) => !curr)
    // eslint-disable-next-line no-console
    queryClient.event.todos.cancel({ done: showDone }).catch(console.warn)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="grid grid-cols-3 px-4 py-6">
        <div className="w-8"></div>
        <div className="relative flex items-center justify-center">
          <Header1 className="bg-neutral-950 text-2xl">Todos</Header1>
        </div>
        <div className="relative flex items-center justify-center">
          <Button size="sm" onClick={toggleShowDone}>
            {showDone ? 'Hide done' : 'Show done'}
          </Button>
        </div>
      </header>
      {error && (
        <Alert
          level="error"
          title="An Error has occurred"
          message={error.message}
        />
      )}
      <ul>
        {todos?.map((todo) => {
          return (
            <li key={todo.id} className="flex items-center gap-1 px-4">
              <Checkbox.Root
                id={`event-todo-${todo.id}`}
                checked={!!todo.done}
                onCheckedChange={(value) =>
                  mutate({
                    id: todo.id,
                    datetime: new Date(0),
                    done: !!value,
                  })
                }
                disabled={isPending}
                className="flex h-4 w-4 items-center justify-center rounded bg-neutral-800"
              >
                <Checkbox.Indicator>
                  <CheckIcon height={20} className="w-3" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label htmlFor={`event-todo-${todo.id}`}>{todo.title}</label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
