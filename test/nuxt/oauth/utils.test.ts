import { describe, it, expect, vi } from 'vitest'
import { oauthRedirectUrl, signJwt, verifyJwt } from '../../../src/runtime/server/utils'
import type { SignJwtOptions } from '../../../src/runtime/server/utils'
import { createEvent } from 'h3'
// import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const privateKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiyvo0X+VQ0yIrOaN
nlrnUclopnvuuMfoc8HHly3505OhRANCAAQWUcdZ8uTSAsFuwtNy4KtsKqgeqYxg
l6kwL5D4N3pEGYGIDjV69Sw0zAt43480WqJv7HCL0mQnyqFmSrxj8jMa
-----END PRIVATE KEY-----
`

// const mockedFetch = vi.fn()
// mockNuxtImport('$fetch', mockedFetch)

describe('signJwt', () => {
  let token: string

  it('should sign a JWT with the given payload and options', async () => {
    const payload = { sub: '1234567890', name: 'John Doe', admin: true }
    const options: SignJwtOptions = {
      keyId: '1E6VioIaNI',
      privateKey,
      expiresIn: '1h'
    }

    token = await signJwt(payload, options)
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
  })

  describe.todo('verifyJwt', () => {
    it('should verify a JWT with the given token and options', async () => {
      const options = {
        publicJwkUrl: 'https://appleid.apple.com/auth/keys',
        audience: 'users',
        issuer: 'example.com'
      }
  
      const payload = await verifyJwt<{ id: string }>(token, options)
      expect(payload).toBeDefined()
      expect(typeof payload).toBe('object')
    })
  })
})

// describe.only('oauthRedirectUrl', () => {
//   it('should generate a valid redirect URL for OAuth', () => {
//     const result = oauthRedirectUrl(createEvent({

//     }, {

//     }))
//   })
// })

