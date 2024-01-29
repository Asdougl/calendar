import { type ChangeEvent, forwardRef, useState, useEffect } from 'react'
import { Input, type InputProps } from '.'
import { exists } from '~/utils/guards'

type NumberInputProps = Omit<
  InputProps,
  'ref' | 'onChange' | 'input' | 'maxLength' | 'minLength' | 'type'
> & {
  onChange: (value: number, error?: 'min' | 'max') => void
  value: number
  min?: number
  max?: number
  error?: boolean
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInputWithRef(
    { value, max, min, onChange: setExternalValue, ...props },
    ref
  ) {
    const [internalValue, setInternalValue] = useState(value.toString())

    useEffect(() => {
      setInternalValue(value.toString())
    }, [value])

    const onInternalChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value
      const numberedValue = +value.replaceAll(/\D/g, '')

      if (isNaN(numberedValue) || value === '') {
        setInternalValue('')
        return
      } else if (exists(max) && numberedValue > max) {
        setExternalValue(max, 'max')
        setInternalValue(max.toString())
      } else if (exists(min) && numberedValue < min) {
        setExternalValue(min, 'min')
        setInternalValue(numberedValue.toString())
      } else {
        setExternalValue(numberedValue)
        setInternalValue(numberedValue.toString())
      }
    }

    return (
      <Input
        ref={ref}
        {...props}
        value={internalValue}
        onChange={onInternalChange}
      />
    )
  }
)
