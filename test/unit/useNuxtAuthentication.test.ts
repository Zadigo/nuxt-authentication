import { describe, expect, it } from 'vitest'
import { useNuxtAuthentication } from '../../src/runtime/composables'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from '#imports'

describe('useNuxtAuthentication', () => {
  it('should be defined', async () => {
    let result: ReturnType<typeof useNuxtAuthentication> | undefined

    await mountSuspended(defineComponent({
      setup() {
        result = useNuxtAuthentication()
        return () => null
      }
    }))
    
    expect(result).toBeDefined()
    expect(result?.isAuthenticated).toBeDefined()

    expect(result?.isAuthenticated.value).toBe(false)
    expect(result?.tokenVerified.value).toBe(false)

  })
})
