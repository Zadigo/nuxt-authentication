import { describe, expect, it, vi } from 'vitest'
import { useUser } from '../../src/runtime/composables'

vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ user_id: '123' }))

describe('composables', () => {
  it('composable structure', () => {
    const { isAuthenticated } = useUser()
    expect(isAuthenticated).toBeDefined()
  })

  it('should be able to get the user id', async () => {
    const { getUserId } = useUser()
    const data = await getUserId()

    expect(getUserId).toBeTypeOf('function')  
    expect(data).toHaveProperty('user_id')
  })
})
