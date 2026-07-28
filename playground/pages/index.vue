<template>
  <section class="my-20 space-y-2">
    <u-container>
      <u-card class="max-w-2xl mx-auto">
        <div class="space-x-4">
          <u-button color="info" to="/login">
            <icon name="i-lucide:link" />
            Login
          </u-button>

          <u-button color="info" to="/via-slot">
            <icon name="i-lucide:link" />
            Login via Slot
          </u-button>

          <u-button color="error" to="/protected">
            <icon name="i-lucide:link" />
            Protected page
          </u-button>

          <u-button color="success" @click="authenticatedFetch">
            <icon name="i-lucide:shield-check" />
            Authenticated Fetch
          </u-button>

          <u-button color="warning" @click="refresh">
            <icon name="i-lucide:refresh-ccw" />
            Refresh Access Token
          </u-button>

          <u-button color="neutral" @click='async () => void verify("Token is invalid or expired")'>
            <icon name="i-lucide:shield-check" />
            Verify Access Token
          </u-button>

          <u-button color="neutral" @click='async () => void executeUnprotected()'>
            <icon name="i-lucide:user" />
            Unprotected
          </u-button>
        </div>
      </u-card>

      <u-card class="max-w-2xl mx-auto mt-5 space-y-4">
        <client-only>
          <p>User ID: {{ userId }}</p>
          <p>Authenticated: {{ isAuthenticated }}</p>
          <p>Token verified: {{ tokenVerified }}</p>
          <p>Has token: {{ isActive }}</p>
          <p>Fetch: {{ response }}</p>
        </client-only>

        <u-button color="error" @click="() => useLogout()">
          <icon name="i-lucide:log-out" />
          Logout
        </u-button>
      </u-card>
    </u-container>
  </section>
</template>

<script lang="ts" setup>
import { useRefreshAccessToken, useAuthenticatedFetch } from '../../src/runtime/composables'

const { tokenVerified, verify, hasToken } = useNuxtAuthentication()
const { isAuthenticated, getUserId } = useUser()

const isActive = computedAsync<boolean>(async () => await hasToken())
const userId = computedAsync(() => getUserId())
  
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
  method: 'GET'
})

const { execute: executeUnprotected } = useAuthenticatedFetch<{ message: string }>('/v1/accounts/unprotected', {
  baseURL: 'http://127.0.0.1:8000',
  method: 'GET'
})

const response = ref<{ id: number, username: string, email: string } | null>(null)
async function authenticatedFetch() {
  response.value = await execute()
  console.log('Authenticated fetch response:', response.value)
}
</script>
