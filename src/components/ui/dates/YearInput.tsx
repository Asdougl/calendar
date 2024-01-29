'use client'

import { type ChangeEvent, useState, useEffect } from 'react'
import { Input, type InputProps } from '../input'

type YearInputProps = {
  value: number
  onBlur: (value: number) => void
} & Omit<InputProps, 'value' | 'onChange' | 'onBlur' | 'ref' | 'type'>

export const YearInput = ({ value, onBlur, ...props }: YearInputProps) => {
  const [year, setYear] = useState(value)

  useEffect(() => {
    setYear(value)
  }, [value])

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value.replaceAll(/\D/g, ''))
    setYear(newValue)
  }

  const internalOnBlur = () => {
    if (year < 1901) {
      setYear(1901)
      onBlur(1901)
    } else if (year > 2099) {
      setYear(2099)
      onBlur(2099)
    } else {
      onBlur(year)
    }
  }

  return (
    <Input
      type="text"
      value={year}
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          internalOnBlur()
        }
        e.stopPropagation()
      }}
      onBlur={internalOnBlur}
      {...props}
    />
  )
}
