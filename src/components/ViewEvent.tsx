import { type FC, type PropsWithChildren, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { usePathname, useSearchParams } from 'next/navigation'
import { DatePicker } from './ui/dates/DatePicker'
import { TimeInput } from './ui/input/time'
import { ButtonLink, SubmitButton } from './ui/button'
import { ErrorText } from './ui/Text'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, getCategoryColor } from '~/utils/classnames'
import { api } from '~/trpc/react'
import { useOrigination } from '~/utils/atoms'
import { useRouter } from '~/utils/hooks'

const ViewEventQuickEditForm = z.object({
  date: z.string(),
  time: z.string().nullable(),
})
type ViewEventQuickEditForm = z.infer<typeof ViewEventQuickEditForm>

type ViewEventProps = {
  event: RouterOutputs['event']['range'][number]
  initialOpen?: boolean
}

export const ViewEvent: FC<PropsWithChildren<ViewEventProps>> = ({
  event,
  children,
  initialOpen = false,
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(initialOpen)

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<ViewEventQuickEditForm>({
    resolver: zodResolver(ViewEventQuickEditForm),
    defaultValues: {
      date: format(event.datetime, 'yyyy-MM-dd'),
      time:
        event.timeStatus === 'STANDARD'
          ? format(event.datetime, 'h:mm a')
          : null,
    },
  })

  const queryClient = api.useContext()

  const { mutateAsync: updateEvent } = api.event.update.useMutation({
    onSuccess: async () => {
      await queryClient.event.invalidate()
    },
    onSettled: (data, error) => {
      if (data && !error) {
        reset({
          date: format(data.datetime, 'yyyy-MM-dd'),
          time:
            data.timeStatus === 'STANDARD'
              ? format(data.datetime, 'h:mm a')
              : null,
        })
      }
    },
  })

  const [originating] = useOrigination()

  const onSubmit = handleSubmit((data) => {
    return updateEvent({
      id: event.id,
      datetime: new Date(`${data.date}T${data.time || '00:00'}`),
    })
  })

  const changeOpen = () => {
    if (open && initialOpen) {
      // If we're closing the dialog, and it was initially open, we want to go back to the originating page
      router.push({
        path: pathname.includes('/inbox') ? '/inbox' : '/events',
        query: {
          ...Object.fromEntries(searchParams),
          event: undefined,
        },
      })
    }
    setOpen(!open)
    reset()
  }

  const formLock = isSubmitting

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/4 z-10 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 p-6">
          {/* Row 0 */}
          <div className="flex items-center justify-between">
            <Dialog.Title className="flex items-stretch gap-2">
              <div
                className={cn(
                  'w-1 flex-shrink-0 rounded-full',
                  getCategoryColor(event.category?.color, 'bg')
                )}
              >
                &nbsp;
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{event.title}</div>
                {event.location && (
                  <div className="text-sm text-neutral-400">
                    {event.location}
                  </div>
                )}
              </div>
            </Dialog.Title>
            <div className="flex h-full flex-col">
              <Dialog.Close className="flex h-6 w-6 items-center justify-center rounded-full ring-neutral-600 hover:bg-neutral-800 focus:outline-none focus:ring">
                <XMarkIcon height={20} />
              </Dialog.Close>
            </div>
          </div>
          {/* Update form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            {/* Row 2 */}
            <div className="flex gap-2 py-4">
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    disabled={formLock}
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
                    disabled={formLock}
                    value={field.value || ''}
                    onChange={field.onChange}
                    className="w-1/2"
                    placeholder="Time (optional)"
                  />
                )}
              />
            </div>
            {/* Row 3 */}
            <div className="flex justify-between">
              <div className="">
                {errors.date && <ErrorText>{errors.date.message}</ErrorText>}
                {errors.time && <ErrorText>{errors.time.message}</ErrorText>}
                {errors.root && <ErrorText>{errors.root.message}</ErrorText>}
              </div>
              <div className="flex gap-2">
                {isDirty && (
                  <SubmitButton
                    intent="primary"
                    type="submit"
                    loading={formLock}
                  >
                    Update
                  </SubmitButton>
                )}
                <ButtonLink
                  path="/events/:id"
                  params={{ id: event.id }}
                  query={{ origin: originating }}
                >
                  More Details
                </ButtonLink>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
