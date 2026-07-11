<template>
  <section class="my-20 space-y-2">
    <nuxt-container>
      <nuxt-card class="max-w-2xl mx-auto">
        <div class="space-x-4">
          <nuxt-button color="info" to="/login">
            <icon name="i-lucide:link" />
            Login
          </nuxt-button>

          <nuxt-button color="info" to="/via-slot">
            <icon name="i-lucide:link" />
            Login via Slot
          </nuxt-button>

          <nuxt-button color="error" to="/protected">
            <icon name="i-lucide:link" />
            Protected page
          </nuxt-button>

          <nuxt-button color="success" @click="authenticatedFetch">
            <icon name="i-lucide:shield-check" />
            Authenticated Fetch
          </nuxt-button>

          <nuxt-button color="warning" @click="refresh">
            <icon name="i-lucide:refresh-ccw" />
            Refresh Access Token
          </nuxt-button>

          <nuxt-button color="warning" @click='async () => void verify("detail", "Token is invalid or expired")'>
            <icon name="i-lucide:shield-check" />
            Verify Access Token
          </nuxt-button>

          <nuxt-button color="warning" @click='async () => void getProfile()'>
            <icon name="i-lucide:user" />
            Get profile
          </nuxt-button>
        </div>
      </nuxt-card>

      <nuxt-card class="max-w-2xl mx-auto mt-5 space-y-4">
        <client-only>
          <p>User ID: {{ userId }}</p>
          <p>Authenticated: {{ isAuthenticated }}</p>
          <p>Token verified: {{ tokenVerified }}</p>
          <p>Has token: {{ isActive }}</p>
        </client-only>

        <nuxt-button color="error" @click="() => useLogout()">
          <icon name="i-lucide:log-out" />
          Logout
        </nuxt-button>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
import { useRefreshAccessToken, useAuthenticatedFetch } from '../../src/runtime/composables'

const { tokenVerified, verify, hasToken } = useNuxtAuthentication()
const { userId, isAuthenticated, getProfile } = useUser<{ email: string, username: string }>()

const isActive = hasToken()

onMounted(async () => {
  if (userId.value) {
    await getProfile()
  }
})

async function refresh() {
  const { renew } = await useRefreshAccessToken()
  await renew()
  console.log('Access token refreshed')
}

/**
 * Authenticated Request
 */

const { execute } = useAuthenticatedFetch<{ id: number, username: string, email: string }>('/v1/accounts/profile', {
  baseURL: 'http://127.0.0.1:8000',
})

async function authenticatedFetch() {
  const response = await execute()
  console.log('Authenticated fetch response:', response)
}
</script>
