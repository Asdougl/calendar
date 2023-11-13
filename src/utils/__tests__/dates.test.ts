import { dateFromDateAndTime, isValidDateString } from '../dates'

describe('dates.ts utils', () => {
  describe('dateFromDateAndTime', () => {
    it('should return a date with the correct time', () => {
      const date = dateFromDateAndTime('2021-01-01', '12:00')
      expect(date.getHours()).toBe(12)
      expect(date.getMinutes()).toBe(0)
    })

    it('should return a date with the correct time when time is null', () => {
      const date = dateFromDateAndTime('2021-01-01', null)
      expect(date.getHours()).toBe(0)
      expect(date.getMinutes()).toBe(0)
    })

    it('should return a date with correct date values', () => {
      const date = dateFromDateAndTime('2021-01-01', '12:00')
      expect(date.getFullYear()).toBe(2021)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(1)
    })
  })

  describe('isValidDateString', () => {
    it('should return true for yyyy-MM-dd string', () => {
      expect(isValidDateString('2021-01-01')).toBe(true)
    })

    it('should return true for ISO string', () => {
      expect(isValidDateString('2021-01-01T00:00:00.000Z')).toBe(true)
    })

    it('should return false for a non-existant date', () => {
      expect(isValidDateString('2021-01-32')).toBe(false)
    })

    it('should return false for a junk string', () => {
      expect(isValidDateString('junk')).toBe(false)
    })

    it('should return false for an empty string', () => {
      expect(isValidDateString('')).toBe(false)
    })
  })
})
