// @vitest-environment node

import { describe, it, expect, beforeAll } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

describe('GET /api/auth/me', async () => {
  await setup({
    server: true
  })

  beforeAll(() => {
    // Stub the upstream Django call so this test never hits a real network,
    // real backend, or depends on test data existing in a live DB
    registerEndpoint('/api/auth/me', {
      method: 'GET',
      handler: () => ({ id: '123' })
    })
  })

  it('returns the user id and sets the user_id cookie when a valid access token cookie is present', async () => {
    // You'll need a valid/decodable JWT here, or mock useJwt itself
    const fakeJwt = 'header.' + Buffer.from(JSON.stringify({ user_id: '123' })).toString('base64') + '.sig'

    const response = await $fetch.raw('/api/auth/me', {
      method: 'GET',
      headers: {
        cookie: `access=${fakeJwt}`
      }
    })

    expect(response._data).toEqual({ id: '123' })

    const setCookie = response.headers.get('set-cookie')
    expect(setCookie).toContain('user_id=123')
    expect(setCookie).toContain('HttpOnly')
  })

  it('throws 401 when no access cookie is present', async () => {
    await expect($fetch('/api/auth/me')).rejects.toMatchObject({
      response: { status: 401 }
    })
  })
})
