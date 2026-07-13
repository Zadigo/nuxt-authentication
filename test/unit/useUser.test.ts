import { describe, expect, it, vi, afterEach } from 'vitest'
import { useUser } from '../../src/runtime/composables'

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()

  return {
    ...actual,
    setCookie: vi.fn<(...args: Parameters<typeof import('h3')['setCookie']>) => void>((..._args: Parameters<typeof import('h3')['setCookie']>) => void 0),
    getCookie: vi.fn<(...args: Parameters<typeof import('h3')['getCookie']>) => string | undefined>((..._args: Parameters<typeof import('h3')['getCookie']>) => '123')
  }
})

describe('useUser', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('composable structure', () => {
    const { isAuthenticated } = useUser()
    expect(isAuthenticated).toBeDefined()
  })

  it('should be able to get the user id', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ id: '123' }))

    const { getUserId } = useUser()
    const data = await getUserId()

    expect(getUserId).toBeTypeOf('function')
    
    expect(data).toHaveProperty('id')
    expect(data).toBeTypeOf('object')

    expect(data.id).toBe('123')
    expect(data.id).toBeTypeOf('string')
  })
})
