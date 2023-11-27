import { render } from '@testing-library/react'
import { MobileTimeInput } from '../mobile-time'

describe('MobileTime Component', () => {
  it('should render correctly', () => {
    render(<MobileTimeInput type="24" value="10:00" onChange={vi.fn()} />)
  })
})
