import { type FC, type PropsWithChildren } from 'react'

type FormProps = {
  onSubmit: (formData: FormData) => void
  className?: string
}

export const Form: FC<PropsWithChildren<FormProps>> = ({
  onSubmit,
  className,
  children,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(new FormData(e.currentTarget))
      }}
      className={className}
    >
      {children}
    </form>
  )
}
