import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { addDays, format } from 'date-fns'
import { useState } from 'react'
import { DatePicker } from '../dates/DatePicker'
import { ACCESSIBLE_FORMAT, DISPLAY_FORMAT, STD_FORMAT } from '../dates/common'

const DEFAULT_DATE = '2023-10-10'

const WrappedDatePicker = ({ initialDate = DEFAULT_DATE }) => {
  const [value, setValue] = useState(initialDate ?? '')
  return (
    <>
      <DatePicker
        value={new Date(value)}
        onChange={(date) => setValue(format(date, STD_FORMAT))}
      />
      <span data-testid="datepicker-result">{value}</span>
    </>
  )
}

const setup = (initialDate = DEFAULT_DATE) => {
  return render(<WrappedDatePicker initialDate={initialDate} />)
}

const setupOpen = async (initialDate = DEFAULT_DATE) => {
  const user = userEvent.setup()

  const utils = setup(initialDate)

  const toggleButton = screen.getByRole('button', {
    name: format(new Date(initialDate), DISPLAY_FORMAT),
  })

  await user.click(toggleButton)

  return {
    user,
    utils,
    toggleButton,
  }
}

describe('DatePicker', () => {
  it('should render and open', async () => {
    const user = userEvent.setup()

    setup()

    const toggleButton = screen.getByRole('button', { name: '10 Oct 2023' })

    expect(toggleButton).toBeInTheDocument()

    await user.click(toggleButton)

    const nextMonthButton = screen.getByRole('button', { name: /next month/i })
    const prevMonthButton = screen.getByRole('button', {
      name: /previous month/i,
    })

    expect(nextMonthButton).toBeInTheDocument()
    expect(prevMonthButton).toBeInTheDocument()

    const monthSelect = screen.getByRole('combobox', { name: /month/i })
    const yearSelect = screen.getByRole('textbox', { name: /year/i })

    // don't forget, months are zero-indexed
    expect(monthSelect).toHaveValue('9')
    expect(yearSelect).toHaveValue('2023')
  })

  it('should contain all dates for month of October 2023', async () => {
    const user = userEvent.setup()

    setup()

    const toggleButton = screen.getByRole('button', { name: '10 Oct 2023' })

    await user.click(toggleButton)

    const dates = screen.getAllByRole('button', {
      name: /^\d{1,2}, \w+, \w+ \d{4}$/,
    })

    // Check first element, should be 25th of September
    expect(dates[0]).toHaveTextContent('25')
    expect(dates[0]).toHaveAttribute('aria-label', '25, Monday, September 2023')

    // Check last element, should be 5th of November
    expect(dates[dates.length - 1]).toHaveTextContent('5')
    expect(dates[dates.length - 1]).toHaveAttribute(
      'aria-label',
      '5, Sunday, November 2023'
    )

    const selected = screen.getByRole('button', {
      name: /10, Tuesday, October 2023/,
    })

    expect(selected).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/selected date/)
    )
  })

  it('should show label on today and selected', async () => {
    const user = userEvent.setup()

    const todayDate = new Date()

    const stdFormat = format(todayDate, STD_FORMAT)
    const labelFormat = format(todayDate, DISPLAY_FORMAT)
    const accessibleFormat = format(todayDate, ACCESSIBLE_FORMAT)
    const accessibleTomorrow = format(addDays(todayDate, 1), ACCESSIBLE_FORMAT)

    setup(stdFormat)

    const toggleButton = screen.getByRole('button', { name: labelFormat })

    await user.click(toggleButton)

    const todayButton = screen.getByRole('button', { name: /today/i })
    const tomorrowButton = screen.getByRole('button', {
      name: new RegExp(accessibleTomorrow),
    })

    expect(todayButton).toHaveAttribute(
      'aria-label',
      `${accessibleFormat}, today, selected date`
    )

    expect(tomorrowButton).toHaveAttribute('aria-label', accessibleTomorrow)

    await user.click(tomorrowButton)

    expect(todayButton).toHaveAttribute(
      'aria-label',
      `${accessibleFormat}, today`
    )
    expect(tomorrowButton).toHaveAttribute(
      'aria-label',
      `${accessibleTomorrow}, selected date`
    )
  })

  it('should change month and year', async () => {
    const { user } = await setupOpen()

    const nextMonthButton = screen.getByRole('button', { name: /next month/i })
    const prevMonthButton = screen.getByRole('button', {
      name: /previous month/i,
    })

    const monthSelect = screen.getByRole('combobox', { name: /month/i })
    const yearInput = screen.getByRole('textbox', { name: /year/i })

    expect(monthSelect).toHaveValue('9')
    expect(yearInput).toHaveValue('2023')

    await user.click(nextMonthButton)

    expect(monthSelect).toHaveValue('10')
    expect(yearInput).toHaveValue('2023')

    await user.click(prevMonthButton)

    expect(monthSelect).toHaveValue('9')
    expect(yearInput).toHaveValue('2023')

    await user.selectOptions(monthSelect, '11')

    expect(monthSelect).toHaveValue('11')
    expect(yearInput).toHaveValue('2023')

    await user.clear(yearInput)
    await user.type(yearInput, '2024')

    expect(yearInput).toHaveValue('2024')
    expect(monthSelect).toHaveValue('11')
  })

  it('should change available dates when month change', async () => {
    const { user } = await setupOpen()

    const dates = screen.getAllByRole('button', {
      name: /^\d{1,2}, \w+, \w+ \d{4}$/,
    })

    // Check first element, should be 25th of September
    expect(dates[0]).toHaveTextContent('25')
    expect(dates[0]).toHaveAttribute('aria-label', '25, Monday, September 2023')

    // Check last element, should be 5th of November
    expect(dates[dates.length - 1]).toHaveTextContent('5')
    expect(dates[dates.length - 1]).toHaveAttribute(
      'aria-label',
      '5, Sunday, November 2023'
    )

    const nextMonthButton = screen.getByRole('button', { name: /next month/i })

    await user.click(nextMonthButton)

    const newDates = screen.getAllByRole('button', {
      name: /^\d{1,2}, \w+, \w+ \d{4}$/,
    })

    // Check first element, should be 30th of October
    expect(newDates[0]).toHaveTextContent('30')
    expect(newDates[0]).toHaveAttribute(
      'aria-label',
      '30, Monday, October 2023'
    )

    // Check last element, should be 3rd of December
    expect(newDates[newDates.length - 1]).toHaveTextContent('3')
    expect(newDates[newDates.length - 1]).toHaveAttribute(
      'aria-label',
      '3, Sunday, December 2023'
    )

    // One more set :)

    await user.click(nextMonthButton)

    const newDates2 = screen.getAllByRole('button', {
      name: /^\d{1,2}, \w+, \w+ \d{4}$/,
    })

    // Check first element, should be 27th of November
    expect(newDates2[0]).toHaveTextContent('27')
    expect(newDates2[0]).toHaveAttribute(
      'aria-label',
      '27, Monday, November 2023'
    )

    // Check last element, should be 31st of December
    expect(newDates2[newDates2.length - 1]).toHaveTextContent('31')
    expect(newDates2[newDates2.length - 1]).toHaveAttribute(
      'aria-label',
      '31, Sunday, December 2023'
    )

    // And double check when we go back it's the same as the first set

    const prevMonthButton = screen.getByRole('button', {
      name: /previous month/i,
    })

    await user.click(prevMonthButton)

    const newDates3 = screen.getAllByRole('button', {
      name: /^\d{1,2}, \w+, \w+ \d{4}$/,
    })

    // Check first element, should be 30th of October
    expect(newDates3[0]).toHaveTextContent('30')
    expect(newDates3[0]).toHaveAttribute(
      'aria-label',
      '30, Monday, October 2023'
    )

    // Check last element, should be 3rd of December
    expect(newDates3[newDates3.length - 1]).toHaveTextContent('3')
    expect(newDates3[newDates3.length - 1]).toHaveAttribute(
      'aria-label',
      '3, Sunday, December 2023'
    )
  })

  it('should emit correct date value', async () => {
    const { user } = await setupOpen()

    const Oct21st = screen.getByRole('button', {
      name: /21, \w+, october 2023/i,
    })

    const result = screen.getByTestId('datepicker-result')

    expect(result).toHaveTextContent('2023-10-10')

    await user.click(Oct21st)

    expect(result).toHaveTextContent('2023-10-21')
  })

  it('should switch focus month when selecting a date from another month', async () => {
    const { user } = await setupOpen()

    const Sept26th = screen.getByRole('button', {
      name: /26, \w+, september 2023/i,
    })

    const result = screen.getByTestId('datepicker-result')

    const monthSelect = screen.getByRole('combobox', { name: /month/i })

    expect(result).toHaveTextContent('2023-10-10')
    expect(monthSelect).toHaveValue('9')

    await user.click(Sept26th)

    expect(result).toHaveTextContent('2023-09-26')
    expect(monthSelect).toHaveValue('8')
  })
})
