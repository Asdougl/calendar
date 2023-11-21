import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { NumberInput } from '../input/number'

describe('Input components', () => {
  describe('<NumberInput /> component', () => {
    it('should render value', () => {
      render(<NumberInput name="number-input" value={100} onChange={vi.fn()} />)

      const numberInput = screen.getByRole('textbox')

      expect(numberInput).toHaveValue('100')
    })

    it('should allow numbered inputs and block text inputs', async () => {
      render(<NumberInput name="number-input" value={100} onChange={vi.fn()} />)

      const numberInput = screen.getByRole('textbox')

      expect(numberInput).toHaveValue('100')

      await userEvent.type(numberInput, 'abc')

      expect(numberInput).toHaveValue('100')

      await userEvent.type(numberInput, '123')

      expect(numberInput).toHaveValue('100123')
    })

    it('should enforce min and max values', async () => {
      render(
        <NumberInput
          name="number-input"
          value={100}
          onChange={vi.fn()}
          min={20}
          max={100}
        />
      )

      const numberInput = screen.getByRole<HTMLInputElement>('textbox')

      expect(numberInput).toHaveValue('100')

      await userEvent.clear(numberInput)
      await userEvent.type(numberInput, '123')

      // 123 is too high, thus number is 100
      expect(numberInput).toHaveValue('100')

      await userEvent.clear(numberInput)
      await userEvent.type(numberInput, '-123')

      // minus sign removed, thus number is 123, too high!
      expect(numberInput).toHaveValue('100')

      await userEvent.clear(numberInput)
      await userEvent.type(numberInput, '20')

      // 20 is the minimum, thus number is 20
      expect(numberInput).toHaveValue('20')

      await userEvent.clear(numberInput)
      await userEvent.type(numberInput, '0')

      // 0 is too low, thus number is 20
      expect(numberInput).toHaveValue('0')
    })
  })
})
