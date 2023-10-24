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
import { type Event } from '@prisma/client'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Header2 } from './ui/headers'
import { Button, SubmitButton } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Loader } from './ui/Loader'
import { UncontrolledDatePicker } from './ui/DatePicker'
import { UncontrolledTimeInput } from './ui/TimeInput'
import { Alert } from './ui/Alert'
import { time, toCalendarDate } from '~/utils/dates'
import { api } from '~/trpc/react'
import { type RouterInputs } from '~/trpc/shared'
import { match } from '~/utils/misc'
import { featureEnabled } from '~/utils/flags'
import { cn, getCategoryColor } from '~/utils/classnames'

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
    onSuccess: async () => {
      await queryClient.event.invalidate()
      setOpen(false)
      formRef.current?.reset()
    },
  })

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = api.event.update.useMutation({
    onSuccess: async () => {
      await queryClient.event.invalidate()
      setOpen(false)
      formRef.current?.reset()
    },
  })

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = api.event.delete.useMutation({
    onSuccess: async () => {
      await queryClient.event.invalidate()
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
    const dateraw = z.string().parse(formData.get('event-date'))
    const time = z.string().parse(formData.get('event-time'))
    const todo = z.string().nullable().parse(formData.get('event-todo'))
    // const todoDone = z
    //   .string()
    //   .nullable()
    //   .parse(formData.get('event-todo-done'))

    const [date] = match(/(\d{4}-\d{2}-\d{2})/, dateraw)

    if (!title) return setErrorMsg('Title is required')
    if (!date) return setErrorMsg('Date is required')

    if ('event' in props) {
      const updateParams: RouterInputs['event']['update'] = {
        id: props.event.id,
        date: date,
      }

      if (title !== props.event.title) {
        updateParams.title = title.trim()
      }

      if (time !== props.event.time) {
        if (time) {
          updateParams.time = `${time[0]}${time[1]}:${time[2]}${time[3]}`
        } else {
          updateParams.time = null
        }
      }

      if (category_id !== props.event.categoryId) {
        updateParams.categoryId =
          category_id === 'none' || !category_id ? null : category_id
      }

      if (todo === 'on' && props.event.done === null) {
        updateParams.done = false
      } else if (todo === 'off' && props.event.done !== null) {
        updateParams.done = null
      }

      if (
        Object.keys(updateParams).length > 2 ||
        updateParams.date !== props.event.date
      ) {
        updateMutate(updateParams)
      }
      // else nothing being updated, don't bother.
    } else {
      insertMutate({
        title,
        date,
        time: time ? `${time[0]}${time[1]}:${time[2]}${time[3]}` : undefined,
        categoryId:
          category_id === 'none' || !category_id ? undefined : category_id,
        todo: todo === 'on',
      })
    }
  }

  const constructLoading = isUpdating || isInserting

  const fullLoading = isLoadingCategories || constructLoading || isDeleting

  const fullDisable = disabled || fullLoading

  const fullError = insertError || updateError || deleteError

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        disabled={fullDisable}
        className="rounded-lg ring-neutral-600 focus:outline-none focus:ring"
      >
        {children ?? <PlusIcon height={20} />}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/4 z-10 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 p-6">
          {/* Row 0 */}
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
            {/* Row 1 -- title */}
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
                autoComplete="off"
              />
            </div>
            <div className="flex w-full flex-col justify-between gap-4">
              {/* Row 2 -- category */}
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
                          <Select.ItemText asChild>
                            <div className="flex items-start justify-start gap-1 md:gap-2">
                              <div className="mt-[7px] h-2 w-2 rounded-full bg-neutral-800"></div>
                              Uncategorised
                            </div>
                          </Select.ItemText>
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
                            <Select.ItemText asChild>
                              <div className="flex items-start justify-start gap-1 md:gap-2">
                                <div
                                  className={cn(
                                    'mt-[7px] h-2 w-2 rounded-full',
                                    getCategoryColor(category.color, 'bg')
                                  )}
                                ></div>
                                {category.name}
                              </div>
                            </Select.ItemText>
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
                {/* Row 3 (Mobile) -- date & time */}
                <div className="flex w-full gap-4 md:w-auto">
                  <UncontrolledDatePicker
                    name="event-date"
                    defaultValue={
                      'event' in props
                        ? props.event.date
                        : toCalendarDate(props.initialDate)
                    }
                    className="flex-grow"
                  />
                  <UncontrolledTimeInput
                    name="event-time"
                    defaultValue={
                      'event' in props && props.event.time
                        ? props.event.time.replaceAll(/[^0-9]/g, '')
                        : ''
                    }
                    className="w-24 flex-grow"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                {featureEnabled('TODOS') && (
                  <div className="flex h-full w-full gap-4">
                    <label
                      htmlFor="event-todo"
                      className="relative flex h-full items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 transition-colors data-[state=checked]:bg-neutral-800"
                    >
                      <Checkbox.Root
                        id="event-todo"
                        name="event-todo"
                        defaultChecked={
                          'event' in props && props.event.done !== null
                        }
                        className="flex h-4 w-4 items-center justify-center rounded bg-neutral-800"
                        disabled
                      >
                        <Checkbox.Indicator>
                          <CheckIcon height={20} className="w-3" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <span className="text-neutral-300">is todo</span>
                    </label>
                    {'event' in props && props.event.done !== null && (
                      <label
                        htmlFor="event-todo-done"
                        className="relative flex h-full items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 transition-colors data-[state=checked]:bg-neutral-800"
                      >
                        <Checkbox.Root
                          id="event-todo-done"
                          name="event-todo-done"
                          defaultChecked={props.event.done}
                          className="flex h-4 w-4 items-center justify-center rounded bg-neutral-800"
                          disabled
                        >
                          <Checkbox.Indicator>
                            <CheckIcon height={20} className="w-3" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <span className="text-neutral-300">done</span>
                      </label>
                    )}
                  </div>
                )}
                <div className="flex flex-grow justify-end gap-4">
                  {'event' in props && (
                    <SubmitButton
                      intent="danger"
                      type="button"
                      loading={isDeleting}
                      onClick={() => deleteMutate({ id: props.event.id })}
                      disabled={fullDisable}
                    >
                      Delete
                    </SubmitButton>
                  )}
                  <SubmitButton
                    loading={constructLoading}
                    intent="primary"
                    type="submit"
                    disabled={fullDisable}
                  >
                    {'event' in props ? 'Save' : 'Add'}
                  </SubmitButton>
                </div>
              </div>
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
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
