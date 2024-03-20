'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { type FC } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header2 } from '../ui/headers'
import { EventForm } from '../form/event/event-form'
import { stdFormat } from '../ui/dates/common'
import { ButtonRawLink } from '../ui/button'
import { cn, color } from '~/utils/classnames'
import { api } from '~/trpc/react'
import {
  SearchParamKeys,
  SEARCH_PARAM_NEW,
  modifyCurrentSearchParams,
} from '~/utils/nav/search'
import { warn } from '~/utils/logging'

const getInitialDate = (date: string | null) => {
  if (!date) return new Date()
  const initialDate = new Date(date)
  if (isNaN(initialDate.getTime())) return new Date()
  return initialDate
}

export const EventModal: FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const session = useSession()

  const enabled =
    searchParams.has(SearchParamKeys.Values.event) &&
    searchParams.get(SearchParamKeys.Values.event) !== SEARCH_PARAM_NEW

  const { data: event, isLoading: isLoadingData } = api.event.one.useQuery(
    { id: searchParams.get(SearchParamKeys.Values.event) || '' },
    {
      enabled,
    }
  )

  const isLoading = isLoadingData && enabled

  const queryClient = api.useUtils()

  const { mutate, isPending: isMutating } = api.event.complete.useMutation({
    onMutate: (data) => {
      const foundEvent = queryClient.event.one.getData({ id: data.id })
      if (foundEvent) {
        queryClient.event.one.setData(
          { id: data.id },
          {
            ...foundEvent,
            done: data.completed,
          }
        )
        return foundEvent
      }
    },
    onSuccess: (data) => {
      queryClient.event.one.invalidate({ id: data.event.id }).catch(warn)
      queryClient.event.range.invalidate().catch(warn)
    },
    onError: (error, data, context) => {
      if (context) {
        queryClient.event.one.setData({ id: context.id }, context)
      }
    },
  })

  const onOpenChange = (value: boolean, jumpTo?: Date) => {
    if (!value) {
      const url = modifyCurrentSearchParams({
        remove: ['event', 'date', 'title', 'time'],
        update: {
          of: jumpTo ? stdFormat(jumpTo) : undefined,
        },
      })

      router.push(url)
    }
  }

  return (
    <Dialog.Root
      open={searchParams.has(SearchParamKeys.Values.event)}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-10 z-10 w-full max-w-xl -translate-x-1/2 p-6 lg:top-24">
          <div className="flex justify-between pb-2">
            <Dialog.Title asChild>
              {enabled && isLoading ? (
                <div className="flex items-center">
                  <div className="animate-pulse rounded-full bg-neutral-800 text-transparent">
                    Event name
                  </div>
                </div>
              ) : (
                <Header2 className="flex items-center gap-2">
                  {/* eslint-disable-next-line @typescript-eslint/prefer-optional-chain */}
                  {event && event?.done !== null ? (
                    <button
                      type="button"
                      onClick={() =>
                        event &&
                        mutate({ id: event.id, completed: !event.done })
                      }
                      disabled={
                        isMutating ||
                        event.createdById !== session.data?.user?.id
                      }
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded border-2',
                        color('border')(event?.category?.color)
                      )}
                    >
                      {event?.done ? <CheckIcon height={18} /> : ' '}
                    </button>
                  ) : (
                    <div
                      className={cn(
                        'h-6 w-1 rounded-full',
                        color('bg')(event?.category?.color)
                      )}
                    ></div>
                  )}
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
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Event Title
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Event Date
                </div>
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Event Category
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Event Time Options
                </div>
                <div className="h-24 w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Event Time Editor
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <div className="animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  More
                </div>
                <div className="animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Submit
                </div>
              </div>
            </div>
          ) : event ? (
            <EventForm
              event={event}
              onSubmit={() => onOpenChange(false)}
              readonly={event.createdById !== session.data?.user?.id}
            />
          ) : (
            <EventForm
              date={getInitialDate(
                searchParams.get(SearchParamKeys.Values.date)
              )}
              onSubmit={(event) => onOpenChange(false, event?.datetime)}
              wipValues={{
                date:
                  searchParams.get(SearchParamKeys.Values.date) ?? undefined,
                time:
                  searchParams.get(SearchParamKeys.Values.time) ?? undefined,
                type: searchParams.get(SearchParamKeys.Values.time)
                  ? 'STANDARD'
                  : 'NO_TIME',
              }}
              extraActions={
                <ButtonRawLink
                  href={modifyCurrentSearchParams({
                    update: { period: SEARCH_PARAM_NEW },
                    remove: ['event'],
                  })}
                >
                  Add Period
                </ButtonRawLink>
              }
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
