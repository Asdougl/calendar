'use client'

import { type Control, useFormState } from 'react-hook-form'
import { forwardRef } from 'react'
import { type ButtonProps, SubmitButton, Button } from './button'
import { cn } from '~/utils/classnames'

type FormButtonProps = ButtonProps<'button'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export const FormSubmitButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  function FwdFormSubmitButton(
    { control, className, children, ...props },
    ref
  ) {
    const { isDirty, isSubmitting } = useFormState({ control })

    return (
      <SubmitButton
        {...props}
        ref={ref}
        className={className}
        disabled={!isDirty || isSubmitting}
        loading={isSubmitting}
      >
        {children}
      </SubmitButton>
    )
  }
)

export const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  function FwdFormButton({ control, ...props }, ref) {
    const { isSubmitting } = useFormState({ control })

    return <Button {...props} ref={ref} disabled={isSubmitting} />
  }
)
