import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import type { FC, FormEvent, PropsWithChildren } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Header2 } from './headers'
import { Button } from './button'
import { Label } from './label'
import { Input } from './input'
import { Loader } from './ui/Loader'
import type { Event } from '@/types/supabase'
import type { Database } from '@/types/typegen'
import { time } from '@/util/dates'

type EventDialogProps = PropsWithChildren<{
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onDelete?: () => void
  disabled?: boolean
  event?: Event
}>

export const EventDialog: FC<EventDialogProps> = ({
  open,
  setOpen,
  onSubmit,
  onDelete,
  disabled,
  event,
  children,
}) => {
  const supabase = createClientComponentClient<Database>()

  const { data: categories, isLoading } = useQuery({
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

  const onOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      setTimeout(() => {
        document.getElementById('event-name')?.focus()
      }, 50)
    }
  }

  const fullDisable = disabled || isLoading

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
              <Header2>{event ? 'Edit Event' : 'Add Event'}</Header2>
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
          <form onSubmit={onSubmit} className="flex flex-col items-start gap-4">
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="event-name" className="sr-only">
                Event name
              </Label>
              <Input
                className="w-full"
                id="event-name"
                name="event-name"
                type="text"
                defaultValue={event?.title}
              />
            </div>
            <div className="w-full flex justify-between flex-wrap gap-4">
              <div className="flex gap-4 flex-grow">
                <Select.Root
                  defaultValue={event?.category_id || undefined}
                  name="event-category-id"
                >
                  <Select.Trigger asChild>
                    <Button
                      disabled={fullDisable}
                      className="flex gap-1 flex-grow md:flex-grow-0"
                    >
                      {isLoading ? (
                        <Loader />
                      ) : (
                        <>
                          <Select.Value
                            placeholder="Category"
                            className="placeholder:opacity-75"
                          />
                          <Select.Icon>
                            <ChevronDownIcon height={20} />
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
                <Input
                  disabled={fullDisable}
                  placeholder="Time"
                  className="w-32"
                />
              </div>
              <div className="flex gap-4 justify-end flex-grow">
                {event && onDelete && (
                  <Button
                    intent="danger"
                    type="button"
                    onClick={onDelete}
                    disabled={fullDisable}
                  >
                    Delete
                  </Button>
                )}
                <Button intent="primary" type="submit" disabled={fullDisable}>
                  {event ? 'Save' : 'Add'}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
