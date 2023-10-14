import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import {
  useState,
  type FC,
  type FormEvent,
  type PropsWithChildren,
  useRef,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'
import { format, set } from 'date-fns'
import { Header2 } from './headers'
import { Button } from './button'
import { Label } from './label'
import { Input } from './input'
import { Loader } from './ui/Loader'
import { UncontrolledDatePicker } from './ui/DatePicker'
import { UncontrolledTimeInput } from './ui/TimeInput'
import { Alert } from './Alert'
import type { Event } from '@/types/supabase'
import type { Database } from '@/types/typegen'
import { time } from '@/util/dates'

type UpdateEventDialogProps = {
  disabled?: boolean
  event: Event
}

type InsertEventDialogProps = {
  disabled?: boolean
  initialDate: Date
}

type EventDialogProps = PropsWithChildren<
  UpdateEventDialogProps | InsertEventDialogProps
>

export const EventDialog: FC<EventDialogProps> = ({
  disabled,
  children,
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const formRef = useRef<HTMLFormElement>(null)

  const supabase = createClientComponentClient<Database>()

  const queryClient = useQueryClient()

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await supabase.from('categories').select('*')
      return response.data || []
    },
    staleTime: time.hours(2),
    refetchInterval: time.hours(3),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  const {
    mutate: insertMutate,
    isPending: isInserting,
    error: insertError,
  } = useMutation({
    mutationFn: async (params: {
      title: string
      datetime: string
      category_id?: string | null
    }) => {
      await supabase.from('events').insert([params])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setOpen(false)
      formRef.current?.reset()
    },
  })

  const {
    mutate: updateMutate,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: async ({
      eventId,
      ...params
    }: {
      eventId: string
      title?: string
      datetime?: string
      category_id?: string | null
    }) => {
      const response = await supabase
        .from('events')
        .update(params)
        .eq('id', eventId)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setOpen(false)
      formRef.current?.reset()
    },
  })

  const {
    mutate: deleteMutate,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await supabase.from('events').delete().eq('id', eventId)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setOpen(false)
      formRef.current?.reset()
    },
  })

  const onOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      setTimeout(() => {
        document.getElementById('event-name')?.focus()
      }, 50)
    }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const title = z.string().parse(formData.get('event-name'))
    const category_id = z.string().parse(formData.get('event-category-id'))
    const date = z.string().parse(formData.get('event-date'))
    const time = z.string().parse(formData.get('event-time'))

    const datetime = time
      ? set(new Date(date), {
          hours: +time.slice(0, 2),
          minutes: +time.slice(2, 4),
        }).toISOString()
      : date

    if ('event' in props) {
      const updateParams: Parameters<typeof updateMutate>[0] = {
        eventId: props.event.id,
      }

      if (title !== props.event.title) {
        updateParams.title = title.trim()
      }

      if (date !== props.event.datetime) {
        updateParams.datetime = datetime
      }

      if (category_id && category_id !== props.event.category_id) {
        updateParams.category_id = category_id === 'none' ? null : category_id
      }

      if (Object.keys(updateParams).length > 1) {
        updateMutate(updateParams)
      }
      // else nothing being updated, don't bother.
    } else {
      if (!title) return setErrorMsg('Title is required')
      if (!datetime) return setErrorMsg('Date is required')

      insertMutate({
        title,
        datetime,
        category_id: category_id === 'none' ? null : category_id,
      })
    }
  }

  const fullLoading =
    isLoadingCategories || isUpdating || isInserting || isDeleting

  const fullDisable = disabled || fullLoading

  const fullError = insertError || updateError || deleteError

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger disabled={fullDisable}>
        {children ?? <PlusIcon height={20} />}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-6 max-w-xl w-full">
          <div className="flex justify-between pb-2">
            <Dialog.Title asChild>
              <Header2>{'event' in props ? 'Edit Event' : 'Add Event'}</Header2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 rounded hover:bg-neutral-800"
                aria-label="close"
              >
                <XMarkIcon height={20} />
              </button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={onSubmit}
            ref={formRef}
            className="flex flex-col items-start gap-4"
          >
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="event-name" className="sr-only">
                Event name
              </Label>
              <Input
                className="w-full"
                id="event-name"
                name="event-name"
                type="text"
                defaultValue={'event' in props ? props.event.title : undefined}
              />
            </div>
            <div className="w-full flex justify-between flex-col gap-4">
              <div className="flex gap-4 flex-grow flex-wrap">
                <Select.Root
                  defaultValue={
                    ('event' in props && props.event.category_id) || undefined
                  }
                  name="event-category-id"
                >
                  <Select.Trigger asChild>
                    <Button
                      disabled={fullDisable}
                      className="flex gap-1 flex-grow justify-between items-center w-full md:w-auto"
                    >
                      {isLoadingCategories ? (
                        <Loader />
                      ) : (
                        <>
                          <Select.Value
                            placeholder="Category"
                            className="placeholder:opacity-75"
                          />
                          <Select.Icon>
                            <ChevronDownIcon height={16} />
                          </Select.Icon>
                        </>
                      )}
                    </Button>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-neutral-950 border border-neutral-800 relative z-10 px-1 py-2 rounded-lg">
                      <Select.ScrollUpButton className="SelectScrollButton">
                        <ChevronUpIcon height={20} />
                      </Select.ScrollUpButton>
                      <Select.Viewport className="flex flex-col gap-1">
                        <Select.Item
                          value="none"
                          className="pl-8 relative pr-4 hover:bg-neutral-900 hover:text-neutral-50 text-neutral-300"
                        >
                          <Select.ItemText>No Category</Select.ItemText>
                          <Select.ItemIndicator className="absolute top-1/2 left-0 -translate-y-1/2">
                            <CheckIcon height={20} />
                          </Select.ItemIndicator>
                        </Select.Item>
                        {categories?.map((category) => (
                          <Select.Item
                            key={category.id}
                            value={category.id}
                            className="pl-8 relative pr-4 hover:bg-neutral-900 hover:text-neutral-50 text-neutral-300"
                          >
                            <Select.ItemText>{category.name}</Select.ItemText>
                            <Select.ItemIndicator className="absolute top-1/2 left-0 -translate-y-1/2">
                              <CheckIcon height={20} />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                      <Select.ScrollDownButton className="SelectScrollButton">
                        <ChevronDownIcon />
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                <div className="flex gap-4 w-full md:w-auto">
                  <UncontrolledDatePicker
                    name="event-date"
                    defaultValue={
                      'event' in props
                        ? props.event.datetime
                        : props.initialDate.toISOString()
                    }
                    className="flex-grow"
                  />
                  <UncontrolledTimeInput
                    name="event-time"
                    defaultValue={
                      'event' in props
                        ? format(new Date(props.event.datetime), 'HHmm')
                        : ''
                    }
                    className="w-24 flex-grow"
                  />
                </div>
              </div>
              <div className="flex justify-between items-start">
                {fullError && (
                  <Alert
                    level="error"
                    title="An Error Occurred"
                    message={fullError.message}
                  />
                )}
                {errorMsg && (
                  <Alert
                    level="error"
                    title="An Error Occurred"
                    message={errorMsg}
                  />
                )}
                <div className="flex gap-4 justify-end flex-grow">
                  {'event' in props && (
                    <Button
                      intent="danger"
                      type="button"
                      onClick={() => deleteMutate(props.event.id)}
                      disabled={fullDisable}
                    >
                      Delete
                    </Button>
                  )}
                  <Button intent="primary" type="submit" disabled={fullDisable}>
                    {fullLoading ? (
                      <Loader />
                    ) : 'event' in props ? (
                      'Save'
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
