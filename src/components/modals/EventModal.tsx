'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { type FC } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header2 } from '../ui/headers'
import { EventForm } from '../form/event/event-form'
import { cn, color } from '~/utils/classnames'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'

const getInitialDate = (date: string | null) => {
  if (!date) return new Date()
  const initialDate = new Date(date)
  if (isNaN(initialDate.getTime())) return new Date()
  return initialDate
}

export const EventModal: FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const enabled =
    searchParams.has('event') && searchParams.get('event') !== 'new'

  const { data: event, isFetching } = api.event.one.useQuery(
    { id: searchParams.get('event') || '' },
    {
      enabled,
      staleTime: Duration.minutes(5),
      refetchOnMount: false,
    }
  )

  const onOpenChange = (value: boolean) => {
    if (!value) {
      const url = new URL(window.location.href)

      url.searchParams.delete('event')
      url.searchParams.delete('date')

      router.push(url.toString())
    }
  }

  return (
    <Dialog.Root open={searchParams.has('event')} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-10 z-10 w-full max-w-xl -translate-x-1/2 p-6 lg:top-24">
          <div className="flex justify-between pb-2">
            <Dialog.Title asChild>
              {enabled && isFetching ? (
                <div className="flex items-center">
                  <div className="animate-pulse rounded-full bg-neutral-800 text-transparent">
                    Event name
                  </div>
                </div>
              ) : (
                <Header2 className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-6 w-1 rounded-full',
                      color('bg')(event?.category?.color)
                    )}
                  ></div>
                  {event ? event.title : 'Add Event'}
                </Header2>
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded px-4 py-2 hover:bg-neutral-800"
                aria-label="close"
              >
                <XMarkIcon height={20} />
              </button>
            </Dialog.Close>
          </div>
          {isFetching ? (
            <div className="h-96 animate-pulse rounded-lg bg-neutral-800" />
          ) : event ? (
            <EventForm event={event} onSubmit={() => onOpenChange(false)} />
          ) : (
            <EventForm
              date={getInitialDate(searchParams.get('date'))}
              onSubmit={() => onOpenChange(false)}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
