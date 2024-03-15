'use client'

import { type ChangeEvent, useState, useEffect } from 'react'
import { Input, type InputProps } from '../input'

type YearInputProps = {
  value: number
  onBlur: (value: number) => void
} & Omit<InputProps, 'value' | 'onChange' | 'onBlur' | 'ref' | 'type'>

export const YearInput = ({ value, onBlur, ...props }: YearInputProps) => {
  const [year, setYear] = useState(value.toString())

  useEffect(() => {
    setYear(value.toString())
  }, [value])

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replaceAll(/\D/g, '')
    setYear(newValue)
    if (newValue.length === 4) {
      const parsedYear = parseInt(newValue)
      if (!isNaN(parsedYear)) {
        onBlur(parsedYear)
      }
    }
  }

  const internalOnBlur = () => {
    let parsedYear = parseInt(year)
    if (isNaN(parsedYear)) {
      parsedYear = 0
    }
    if (parsedYear < 1901) {
      setYear('1901')
      onBlur(1901)
    } else if (parsedYear > 2099) {
      setYear('2099')
      onBlur(2099)
    } else {
      onBlur(parsedYear)
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
