import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { useLogin } from '../src/runtime/composables'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  // it('renders the index page', async () => {
  //   // Get response to a server-rendered page with `$fetch`.
  //   const html = await $fetch('/')
  //   expect(html).toContain('<div>basic</div>')
  // })

  it('can login the user', async() => {
    const { usernameField,  password, login, canBeSubmitted,failureCount, accessToken, refreshToken } = useLogin()
    expect(canBeSubmitted.value).toBe(false)

    usernameField.value = 'test@example.com'
    password.value = 'password'

    expect(canBeSubmitted.value).toBe(true)

    await login()

    expect(failureCount.value).toBe(0)
    expect(accessToken.value).toBeDefined()
    expect(refreshToken.value).toBeDefined()
  })
})
