import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
    it('merges class names correctly', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
        expect(cn('class1', 'class2', undefined)).toBe('class1 class2')
    })

    it('merges Tailwind classes with conflicts', () => {
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('handles empty inputs', () => {
        expect(cn()).toBe('')
    })

    it('handles undefined and null', () => {
        expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
    })
})
