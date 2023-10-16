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
import { z } from 'zod'
import { format, set } from 'date-fns'
import { type Event } from '@prisma/client'
import { Header2 } from './ui/headers'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Loader } from './ui/Loader'
import { UncontrolledDatePicker } from './ui/DatePicker'
import { UncontrolledTimeInput } from './ui/TimeInput'
import { Alert } from './ui/Alert'
import { time } from '~/utils/dates'
import { api } from '~/trpc/react'
import { type RouterInputs } from '~/trpc/shared'

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

  const queryClient = api.useContext()

  // const { data: categories, isLoading: isLoadingCategories } = useQuery({
  //   queryKey: ['categories'],
  //   queryFn: async () => {
  //     const response = await supabase.from('categories').select('*')
  //     return response.data || []
  //   },
  //   staleTime: time.hours(2),
  //   refetchInterval: time.hours(3),
  //   refetchOnMount: false,
  //   refetchOnReconnect: false,
  //   refetchOnWindowFocus: false,
  // })

  const { data: categories, isLoading: isLoadingCategories } =
    api.category.all.useQuery(undefined, {
      staleTime: time.hours(2),
      refetchInterval: time.hours(3),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    })

  const {
    mutate: insertMutate,
    isLoading: isInserting,
    error: insertError,
  } = api.event.create.useMutation({
    onSuccess: () => {
      queryClient.event.invalidate().catch(console.error)
      setOpen(false)
      formRef.current?.reset()
    },
  })

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = api.event.update.useMutation({
    onSuccess: () => {
      queryClient.event.invalidate().catch(console.error)
      setOpen(false)
      formRef.current?.reset()
    },
  })

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = api.event.delete.useMutation({
    onSuccess: () => {
      queryClient.event.invalidate().catch(console.error)
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
        })
      : new Date(date)

    if ('event' in props) {
      const updateParams: RouterInputs['event']['update'] = {
        id: props.event.id,
      }

      if (title !== props.event.title) {
        updateParams.title = title.trim()
      }

      if (datetime !== props.event.datetime) {
        updateParams.datetime = datetime
      }

      if (category_id && category_id !== props.event.categoryId) {
        updateParams.categoryId =
          category_id === 'none' || !category_id ? undefined : category_id
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
        categoryId:
          category_id === 'none' || !category_id ? undefined : category_id,
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
        <Dialog.Content className="fixed left-1/2 top-1/4 z-10 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 p-6">
          <div className="flex justify-between pb-2">
            <Dialog.Title asChild>
              <Header2>{'event' in props ? 'Edit Event' : 'Add Event'}</Header2>
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
          <form
            onSubmit={onSubmit}
            ref={formRef}
            className="flex flex-col items-start gap-4"
          >
            <div className="flex w-full flex-col gap-1">
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
            <div className="flex w-full flex-col justify-between gap-4">
              <div className="flex flex-grow flex-wrap gap-4">
                <Select.Root
                  defaultValue={
                    'event' in props && props.event.categoryId
                      ? props.event.categoryId
                      : undefined
                  }
                  name="event-category-id"
                >
                  <Select.Trigger asChild>
                    <Button
                      disabled={fullDisable}
                      className="flex w-full flex-grow items-center justify-between gap-1 md:w-auto"
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
                    <Select.Content className="relative z-10 rounded-lg border border-neutral-800 bg-neutral-950 px-1 py-2">
                      <Select.ScrollUpButton className="SelectScrollButton">
                        <ChevronUpIcon height={20} />
                      </Select.ScrollUpButton>
                      <Select.Viewport className="flex flex-col gap-1">
                        <Select.Item
                          value="none"
                          className="relative pl-8 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50"
                        >
                          <Select.ItemText>No Category</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-0 top-1/2 -translate-y-1/2">
                            <CheckIcon height={20} />
                          </Select.ItemIndicator>
                        </Select.Item>
                        {categories?.map((category) => (
                          <Select.Item
                            key={category.id}
                            value={category.id}
                            className="relative pl-8 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50"
                          >
                            <Select.ItemText>{category.name}</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-0 top-1/2 -translate-y-1/2">
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
                <div className="flex w-full gap-4 md:w-auto">
                  <UncontrolledDatePicker
                    name="event-date"
                    defaultValue={
                      'event' in props
                        ? props.event.datetime.toISOString()
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
              <div className="flex items-start justify-between">
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
                <div className="flex flex-grow justify-end gap-4">
                  {'event' in props && (
                    <Button
                      intent="danger"
                      type="button"
                      onClick={() => deleteMutate({ id: props.event.id })}
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
