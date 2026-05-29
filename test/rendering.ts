import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  // 2. Setup Nuxt with this fixture inside your test file
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssr', import.meta.url)),
  })

  it('renders the index page', async () => {
    // 3. Interact with the fixture using utilities from `@nuxt/test-utils`
    const html = await $fetch('/')

    // 4. Perform checks related to this fixture
    expect(html).toContain('<div>ssr</div>')
  })
})
