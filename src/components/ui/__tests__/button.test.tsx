import { render, screen } from '@testing-library/react'
import { SubmitButton } from '../button'

describe('Button Components', () => {
  describe('<SubmitButton /> Component', () => {
    it('should render', () => {
      render(<SubmitButton>Hello World</SubmitButton>)

      expect(screen.getByText('Hello World')).not.toHaveClass('opacity-0')
      expect(screen.getByTestId('loader')).toHaveClass('opacity-0')
    })

    it('should have loading spinner', () => {
      render(<SubmitButton loading>Hello World</SubmitButton>)

      const text = screen.getByText('Hello World')
      const loader = screen.getByTestId('loader')

      expect(text).toHaveClass('opacity-0')
      expect(loader).not.toHaveClass('opacity-0')
    })
  })
})
