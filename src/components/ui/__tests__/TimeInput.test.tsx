import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { TimeInput } from '../TimeInput'

const WrappedTimeInput = ({ initialValue = '' }) => {
  const [value, setValue] = useState(initialValue)

  return <TimeInput name="time-input" value={value} onChange={setValue} />
}

describe('<TimeInput /> component', () => {
  it('should render value', () => {
    render(<WrappedTimeInput initialValue="1000" />)

    const timeInput = screen.getByRole('textbox')

    expect(timeInput).toHaveValue('1000')
  })

  it('should handle letters', async () => {
    const user = userEvent.setup()
    render(<WrappedTimeInput initialValue="1000" />)

    const timeInput = screen.getByRole('textbox')

    expect(timeInput).toHaveValue('1000')

    await user.type(timeInput, 'abc')

    expect(timeInput).toHaveValue('1000')
  })

  it('should handle too long inputs', async () => {
    const user = userEvent.setup()
    render(<WrappedTimeInput />)

    const timeInput = screen.getByRole('textbox')

    expect(timeInput).toHaveValue('')

    await user.type(timeInput, '10000')

    expect(timeInput).toHaveValue('1000')
  })

  it('should handle non 24hr inputs', async () => {
    const user = userEvent.setup()
    render(<WrappedTimeInput />)

    const timeInput = screen.getByRole('textbox')

    await user.type(timeInput, '2500')

    expect(timeInput).toHaveClass('border-red-500')
  })
})
