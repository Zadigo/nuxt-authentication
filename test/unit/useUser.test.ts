import { describe, expect, it } from 'vitest'
import { useUser } from '../../src/runtime/composables'

describe('composables', () => {
  it('composable structure', () => {
    const { isAuthenticated } = useUser()
    expect(isAuthenticated).toBeDefined()
  })
})
