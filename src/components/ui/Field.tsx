import { useId, type FC, type PropsWithChildren, forwardRef } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Input, type InputProps } from './input'
import { Label, type LabelProps } from './label'
import { cn } from '~/utils/classnames'

const fieldStyle = cva('flex gap-1', {
  variants: {
    width: {
      sm: 'w-32',
      md: 'w-full lg:w-48',
      lg: 'w-full lg:w-64',
      full: 'w-full',
    },
    orentation: {
      row: 'flex-row',
      column: 'flex-col',
    },
  },
  defaultVariants: {
    width: 'lg',
    orentation: 'column',
  },
})

type FieldProps = {
  label: string
  id?: string
  className?: string
  condition?: LabelProps['condition']
  error?: string
  skeleton?: boolean
  subtext?: string
} & VariantProps<typeof fieldStyle>

export const Field: FC<PropsWithChildren<FieldProps>> = ({
  label,
  id,
  className,
  condition,
  width,
  children,
  skeleton,
  error,
  subtext,
}) => {
  return (
    <div className={cn(fieldStyle({ width }), 'group', className)}>
      <Label
        condition={condition}
        htmlFor={id}
        className="group-focus-within:text-neutral-50"
      >
        <span
          className={cn(
            skeleton &&
              'animate-pulse rounded-full bg-neutral-800 text-transparent'
          )}
        >
          {label}
        </span>
      </Label>
      {children}
      <div
        className={cn('-mt-1 pl-1', {
          'text-red-300': error,
          'text-neutral-400': subtext,
        })}
      >
        {error ? (
          <span className="text-xs">{error}</span>
        ) : subtext ? (
          <span className="text-xs">{subtext}</span>
        ) : (
          <>&nbsp;</>
        )}
      </div>
    </div>
  )
}

export const InputField = forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'error'> & FieldProps
>(function InputFieldWithRef({ id, error, ...props }, ref) {
  const internalId = useId()

  const htmlId = id || internalId

  return (
    <Field id={htmlId} error={error} {...props}>
      <Input id={htmlId} width="full" error={!!error} {...props} ref={ref} />
    </Field>
  )
})
