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

          <nuxt-button color="warning" @click="refresh">
            <icon name="i-lucide:refresh-ccw" />
            Refresh Access Token
          </nuxt-button>
        </div>
      </nuxt-card>

      <nuxt-card class="max-w-2xl mx-auto mt-5 space-y-4">
        <p>User ID: {{ userId }}</p>
        <p>Authenticated: {{ isAuthenticated }}</p>
        <p>Token verified: {{ tokenVerified }}</p>

        <nuxt-button color="error" @click="() => useLogout()">
          <icon name="i-lucide:log-out" />
          Logout
        </nuxt-button>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
import { useRefreshAccessToken } from '../../src/runtime/composables'

const { tokenVerified } = useNuxtAuthentication()
const { userId, isAuthenticated, getProfile } = useUser<{ email: string, username: string }>()

onMounted(async () => {
  if (userId.value) {
    await getProfile(`/v1/accounts/profile`)
  }
})

async function refresh() {
  const { accessToken } = await useRefreshAccessToken()
  console.log('access', toValue(accessToken))
}
</script>
