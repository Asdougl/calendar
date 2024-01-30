'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { type PropsWithChildren, type FC } from 'react'
import { Button, SubmitButton } from '../ui/button'
import { useToggle } from '~/utils/hooks'

type DeleteButtonProps = {
  onDelete: () => Promise<unknown> | void
  isDeleting?: boolean
  title: string
  body?: string
  buttonText?: string
}

export const DeleteButton: FC<PropsWithChildren<DeleteButtonProps>> = ({
  onDelete,
  isDeleting,
  body,
  title,
  children,
  buttonText,
}) => {
  const [open, toggleOpen] = useToggle(false)

  const handleDelete = async () => {
    await onDelete()
    toggleOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={toggleOpen}>
      <Dialog.Trigger asChild>
        <Button intent="danger">{children}</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/4 z-10 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-800 bg-neutral-950 p-6">
          <div className="flex flex-col gap-4">
            <Dialog.Title className="text-2xl font-bold">{title}</Dialog.Title>
            <div className="text-lg">
              {body || 'Are you sure you want to delete this?'}
            </div>
            <div className="flex justify-end gap-4">
              <SubmitButton
                type="button"
                onClick={handleDelete}
                intent="danger"
                className="flex items-center justify-center"
                disabled={isDeleting}
                loading={isDeleting}
              >
                {buttonText || 'Delete'}
              </SubmitButton>
              <Dialog.Close asChild>
                <Button>Cancel</Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
