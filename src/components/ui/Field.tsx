import { useId, type FC, type PropsWithChildren } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Input, type InputProps } from './input'
import { Label, type LabelProps } from './label'
import { cn } from '~/utils/classnames'

const fieldStyle = cva('flex flex-col gap-1', {
  variants: {
    width: {
      sm: 'w-32',
      md: 'w-48',
      lg: 'w-64',
      full: 'w-full',
    },
  },
  defaultVariants: {
    width: 'lg',
  },
})

type FieldProps = {
  label: string
  id: string
  className?: string
  condition?: LabelProps['condition']
  error?: string
} & VariantProps<typeof fieldStyle>

export const Field: FC<PropsWithChildren<FieldProps>> = ({
  label,
  id,
  className,
  condition,
  width,
  children,
  error,
}) => {
  return (
    <div className={cn(fieldStyle({ width }), 'group', className)}>
      <Label
        condition={condition}
        htmlFor={id}
        className="group-focus-within:text-neutral-50"
      >
        {label}
      </Label>
      {children}
      <div className="-mt-1 text-red-300">
        {error ? <span className="text-xs">{error}</span> : <>&nbsp;</>}
      </div>
    </div>
  )
}

export const InputField: FC<
  Omit<InputProps, 'error'> & Omit<FieldProps, 'id'>
> = ({ id, error, ...props }) => {
  const internalId = useId()

  const htmlId = id || internalId

  return (
    <Field id={htmlId} error={error} {...props}>
      <Input id={htmlId} width="full" error={!!error} {...props} />
    </Field>
  )
}
