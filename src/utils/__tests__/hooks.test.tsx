import { act, renderHook } from '@testing-library/react'
import {
  useStateMap,
  useStateSet,
  useDebouncedState,
  useMountEffect,
} from '../hooks'

describe('hooks.ts utils', () => {
  describe('useDebouncedState', () => {
    beforeAll(() => {
      vi.useFakeTimers()
    })

    it('should return a debounced value', () => {
      const { result } = renderHook(() => useDebouncedState('initial', 100))
      expect(result.current[0]).toBe('initial')
      act(() => {
        result.current[1]('new')
      })
      expect(result.current[0]).toBe('initial')
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current[0]).toBe('new')
    })
  })

  describe('useMountEffect', () => {
    it('should call the callback on mount', () => {
      const callback = vi.fn()
      const { rerender } = renderHook(() => useMountEffect(callback))
      expect(callback).toHaveBeenCalledTimes(1)
      rerender()
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('useStateMap', () => {
    it('should return a state map', () => {
      const { result } = renderHook(() => useStateMap({ foo: 'bar' }))

      expect(result.current.get('foo')).toBe('bar')
      expect(result.current.has('foo')).toBe(true)
    })

    it('can be initialised with no data', () => {
      const { result } = renderHook(() => useStateMap())

      expect(result.current.get('foo')).toBe(undefined)
      expect(result.current.has('foo')).toBe(false)
    })

    it('should update state map', () => {
      const { result } = renderHook(() =>
        useStateMap({ foo: 'bar', baz: 'qux' })
      )

      act(() => {
        result.current.set('foo', 'baz')
      })

      expect(result.current.get('foo')).toBe('baz')
      expect(result.current.get('baz')).toBe('qux')
    })

    it('should clear state map', () => {
      const { result } = renderHook(() =>
        useStateMap({ foo: 'bar', baz: 'qux' })
      )

      act(() => {
        result.current.clear()
      })

      expect(result.current.get('foo')).toBe(undefined)
      expect(result.current.get('baz')).toBe(undefined)
    })

    it('should remove from state map', () => {
      const { result } = renderHook(() =>
        useStateMap({ foo: 'bar', baz: 'qux' })
      )

      act(() => {
        result.current.delete('foo')
      })

      expect(result.current.get('foo')).toBe(undefined)
      expect(result.current.get('baz')).toBe('qux')
    })

    it('should return state map size', () => {
      const { result } = renderHook(() =>
        useStateMap({ foo: 'bar', baz: 'qux' })
      )

      expect(result.current.size).toBe(2)
    })

    it('should return state map entries', () => {
      const { result } = renderHook(() =>
        useStateMap({ foo: 'bar', baz: 'qux' })
      )

      expect(Array.from(result.current.entries())).toEqual([
        ['foo', 'bar'],
        ['baz', 'qux'],
      ])
    })

    it('should return state map keys', () => {
      const { result } = renderHook(() =>
        useStateMap({ foo: 'bar', baz: 'qux' })
      )

      expect(Array.from(result.current.keys())).toEqual(['foo', 'baz'])
    })

    it('should return state map values', () => {
      const { result } = renderHook(() =>
        useStateMap({ foo: 'bar', baz: 'qux' })
      )

      expect(Array.from(result.current.values())).toEqual(['bar', 'qux'])
    })
  })

  describe('useStateSet', () => {
    it('should return a state set', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      expect(result.current.has('foo')).toBe(true)
      expect(result.current.has('bar')).toBe(true)
    })

    it('can be initialised with no data', () => {
      const { result } = renderHook(() => useStateSet())

      expect(result.current.has('foo')).toBe(false)
      expect(result.current.has('bar')).toBe(false)
    })

    it('should update state set', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      act(() => {
        result.current.add('baz')
      })

      expect(result.current.has('foo')).toBe(true)
      expect(result.current.has('bar')).toBe(true)
      expect(result.current.has('baz')).toBe(true)
    })

    it('should clear state set', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      act(() => {
        result.current.clear()
      })

      expect(result.current.has('foo')).toBe(false)
      expect(result.current.has('bar')).toBe(false)
    })

    it('should remove from state set', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      act(() => {
        result.current.delete('foo')
      })

      expect(result.current.has('foo')).toBe(false)
      expect(result.current.has('bar')).toBe(true)
    })

    it('should return state set size', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      expect(result.current.size).toBe(2)
    })

    it('should return state set entries', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      expect(Array.from(result.current.entries())).toEqual([
        ['foo', 'foo'],
        ['bar', 'bar'],
      ])
    })

    it('should return state set keys', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      expect(Array.from(result.current.keys())).toEqual(['foo', 'bar'])
    })

    it('should return state set values', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      expect(Array.from(result.current.values())).toEqual(['foo', 'bar'])
    })

    it('should return state as an array', () => {
      const { result } = renderHook(() => useStateSet(['foo', 'bar']))

      expect(result.current.toArray()).toEqual(['foo', 'bar'])
    })
  })
})
