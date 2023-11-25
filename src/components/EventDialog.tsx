import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import * as Dialog from '@radix-ui/react-dialog'
import { useState, type FC, type PropsWithChildren, useRef } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { format, isValid } from 'date-fns'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Header2 } from './ui/headers'
import { Button, SubmitButton } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { DatePicker } from './ui/dates/DatePicker'
import { TimeInput } from './ui/TimeInput'
import { Alert } from './ui/Alert'
import { CategorySelect } from './form/CategorySelect'
import { dateFromDateAndTime } from '~/utils/dates'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { useOrigination } from '~/utils/atoms'
import { pathReplace } from '~/utils/path'

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

  const router = useRouter()

  const [originating] = useOrigination()

  const queryClient = api.useContext()

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
    handleSubmit,
    register,
    control,
    setError,
    getValues,
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
        'event' in props && props.event.category
          ? props.event.category.id
          : 'none',
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

  const fullLoading = constructLoading

  const fullDisable = disabled || fullLoading

  const fullError = insertError || updateError

  const onMore = () => {
    const values = getValues()

    const search = {
      origin: originating,
      title: values.title || undefined,
      date: values.date || undefined,
      time: values.time || undefined,
      categoryId:
        values.categoryId && values.categoryId !== 'none'
          ? values.categoryId
          : undefined,
    }

    router.push(
      pathReplace({
        path: '/events/:id',
        params: {
          id: 'event' in props ? props.event.id : 'new',
        },
        query: search,
      })
    )
  }

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
            <div className="flex w-full gap-1">
              <Label htmlFor="event-name" className="sr-only">
                Event name
              </Label>
              <Input
                className="w-full flex-grow"
                id="event-name"
                {...register('title')}
                autoComplete="off"
                placeholder="Event Name"
              />
            </div>
            <div className="flex w-full flex-col justify-between gap-4">
              {/* Row 2 -- category */}
              <div className="flex flex-grow flex-wrap gap-4">
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <CategorySelect
                      value={field.value}
                      onChange={field.onChange}
                      className="flex-grow"
                    />
                  )}
                />
                {/* Row 3 (Mobile) -- date & time */}
                <div className="flex w-full flex-grow gap-4 md:w-auto">
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? new Date(field.value) : new Date()}
                        onChange={(value) =>
                          field.onChange(format(value, 'yyyy-MM-dd'))
                        }
                        className="w-1/2 flex-grow"
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
                        className="w-1/2"
                        placeholder="0000 (optional)"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-grow justify-end gap-4">
                  <Button onClick={onMore}>More</Button>
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
