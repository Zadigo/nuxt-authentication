import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: [ 'text', 'json', 'html' ]
    },
    env: {
      NODE_ENV: 'test'
    },
    projects: [
      await defineVitestProject({
        test: {
          name: 'unit',
          include: ['test/{e2e,unit}/*.{test,spec}.ts'],
          tags: [
            {
              name: 'unit',
              description: 'Unit tests that do not require a Nuxt instance'
            }
          ],
          environment: 'nuxt',
          testTimeout: 20000
        }
      }),
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          tags: [
            {
              name: 'nuxt',
              description: 'Unit tests that require a Nuxt instance'
            }
          ],
          environment: 'nuxt',
          testTimeout: 20000
        }
      }),
      await defineVitestProject({
        test: {
          name: 'integration',
          include: ['test/integration/*.{test,spec}.ts'],
          tags: [
            {
              name: 'integration',
              description: 'Integration tests that require a running Nuxt server'
            }
          ],
          environment: 'node',
          testTimeout: 20000
        }
      })
    ]
  },
  resolve: {}
})
