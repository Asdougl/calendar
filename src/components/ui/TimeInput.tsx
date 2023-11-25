import { useState, type ChangeEvent, type FC } from 'react'
import { Input, type InputProps } from './input'
import { cn } from '~/utils/classnames'

type TimeInputProps = {
  value: string
  onChange: (time: string) => void
  name?: string
  className?: string
} & Pick<InputProps, 'size' | 'width' | 'error' | 'skeleton' | 'placeholder'>

export const TimeInput: FC<TimeInputProps> = ({
  value,
  onChange,
  name,
  className,
  ...props
}) => {
  const [valid, setValid] = useState(true)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value.replaceAll(/[^0-9]/g, '')

    // no match, return
    if (input.length > 4) return

    if (input.length === 4) {
      // Define a regular expression pattern to match "hh:mm" format
      const timePattern = /^([0-1]?[0-9]|2[0-3])[0-5][0-9]$/

      setValid(timePattern.test(input))
    }
    onChange(input)
  }

  return (
    <Input
      {...props}
      type="text"
      maxLength={4}
      placeholder={props.placeholder ?? '0000'}
      className={cn(className, { 'border-red-500': !valid })}
      name={name}
      value={value === '0000' ? '' : value}
      onChange={handleChange}
    />
  )
}

export const UncontrolledTimeInput: FC<
  Omit<TimeInputProps, 'value' | 'onChange'> & {
    defaultValue: string
    name: string
  }
> = ({ defaultValue, ...props }) => {
  const [value, setValue] = useState(defaultValue ?? '')

  const handleChange = (time: string) => {
    setValue(time)
  }

  return <TimeInput {...props} value={value} onChange={handleChange} />
}
