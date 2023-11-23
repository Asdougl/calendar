import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import { useState, type FC, type PropsWithChildren, useRef } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { format, isValid } from 'date-fns'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header2 } from './ui/headers'
import { Button, ButtonLink, SubmitButton } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Loader } from './ui/Loader'
import { DatePicker } from './ui/dates/DatePicker'
import { TimeInput } from './ui/TimeInput'
import { Alert } from './ui/Alert'
import { dateFromDateAndTime, time } from '~/utils/dates'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, getCategoryColor } from '~/utils/classnames'
import { useOrigination } from '~/utils/atoms'

const EventDialogFormSchema = z.object({
  title: z.string(),
  date: z.string(),
  time: z.string().nullable(),
  categoryId: z.string().nullable(),
})
type EventDialogFormSchema = z.infer<typeof EventDialogFormSchema>

type EventDialogBaseProps = {
  disabled?: boolean
}

type UpdateEventDialogProps = EventDialogBaseProps & {
  event: RouterOutputs['event']['range'][number]
}

type InsertEventDialogProps = EventDialogBaseProps & {
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

  const formRef = useRef<HTMLFormElement>(null)

  const [originating] = useOrigination()

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

  const {
    handleSubmit,
    register,
    control,
    setError,
    formState: { isDirty, errors },
  } = useForm<EventDialogFormSchema>({
    defaultValues: {
      title: 'event' in props ? props.event.title : '',
      date:
        'event' in props
          ? format(props.event.datetime, 'yyyy-MM-dd')
          : format(props.initialDate, 'yyyy-MM-dd'),
      time: 'event' in props ? format(props.event.datetime, 'HHmm') : '',
      categoryId:
        'event' in props && props.event.category ? props.event.category.id : '',
    },
    resolver: zodResolver(EventDialogFormSchema),
  })

  const onOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      setTimeout(() => {
        document.getElementById('event-name')?.focus()
      }, 50)
    }
  }

  const onSubmit = handleSubmit((data) => {
    const formattedTime =
      data.time && /^([0-1]?[0-9]|2[0-3])[0-5][0-9]$/.test(data.time)
        ? `${data.time.slice(0, 2)}:${data.time.slice(2)}`
        : '12:00'

    if ('event' in props) {
      const dateTime = dateFromDateAndTime(data.date, formattedTime)

      if (!isValid(dateTime)) {
        setError('date', { message: 'Invalid date' })
        return
      }

      updateMutate({
        id: props.event.id,
        title: data.title,
        timeStatus: data.time ? 'STANDARD' : 'NO_TIME',
        datetime: dateTime,
        categoryId:
          data.categoryId && data.categoryId !== 'none'
            ? data.categoryId
            : undefined,
      })
    } else {
      const dateTime = dateFromDateAndTime(data.date, formattedTime)

      if (!isValid(dateTime)) {
        setError('date', { message: 'Invalid date' })
        return
      }
      insertMutate({
        title: data.title,
        timeStatus: data.time ? 'STANDARD' : 'NO_TIME',
        datetime: dateTime,
        categoryId:
          data.categoryId && data.categoryId !== 'none'
            ? data.categoryId
            : undefined,
      })
    }
  })

  const constructLoading = isUpdating || isInserting

  const fullLoading = isLoadingCategories || constructLoading || isDeleting

  const fullDisable = disabled || fullLoading

  const fullError = insertError || updateError || deleteError

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        disabled={fullDisable}
        className="rounded-lg px-1 ring-neutral-600 hover:bg-neutral-800 focus:outline-none focus:ring"
        asChild={!!children}
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
                {...register('title')}
                autoComplete="off"
              />
            </div>
            <div className="flex w-full flex-col justify-between gap-4">
              {/* Row 2 -- category */}
              <div className="flex flex-grow flex-wrap gap-4">
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select.Root
                      value={field.value || 'none'}
                      onValueChange={field.onChange}
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
                  )}
                />
                {/* Row 3 (Mobile) -- date & time */}
                <div className="flex w-full gap-4 md:w-auto">
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? new Date(field.value) : new Date()}
                        onChange={(value) =>
                          field.onChange(format(value, 'yyyy-MM-dd'))
                        }
                        className="flex-grow"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="time"
                    render={({ field }) => (
                      <TimeInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="w-24 flex-grow"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* {featureEnabled('TODOS') && (
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
                )} */}
                <div className="flex flex-grow justify-end gap-4">
                  {'event' in props && (
                    <>
                      <ButtonLink
                        path="/events/:id"
                        params={{ id: props.event.id }}
                        query={{ origin: originating }}
                      >
                        More
                      </ButtonLink>
                      <SubmitButton
                        intent="danger"
                        type="button"
                        loading={isDeleting}
                        onClick={() => deleteMutate({ id: props.event.id })}
                        disabled={fullDisable}
                      >
                        Delete
                      </SubmitButton>
                    </>
                  )}
                  <SubmitButton
                    loading={constructLoading}
                    intent="primary"
                    type="submit"
                    disabled={fullDisable || !isDirty}
                  >
                    {'event' in props ? 'Save' : 'Add'}
                  </SubmitButton>
                </div>
              </div>
              {fullError && (
                <Alert
                  level="error"
                  title="An API Error Occurred"
                  message={fullError.message}
                />
              )}
              {Object.keys(errors).length > 0 && (
                <Alert
                  level="error"
                  title="A Form Error Occurred"
                  message={Object.values(errors)
                    .map((error) => error.message)
                    .join(', ')}
                />
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
