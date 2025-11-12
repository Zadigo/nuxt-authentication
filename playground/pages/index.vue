<template>
  <section>
    <nuxt-container>
      <nuxt-button to="/login">
        Login
      </nuxt-button>

      <nuxt-button to="/protected">
        Protected
      </nuxt-button>

      <nuxt-button @click="refresh">
        Refresh Access Token
      </nuxt-button>

      <nuxt-button to="/via-slot">
        Login via Slot
      </nuxt-button>

      <nuxt-card>
        {{ userId }} - {{ isAuthenticated }}

        <nuxt-button @click="useLogout">
          Logout
        </nuxt-button>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
import { useRefreshAccessToken } from '../../src/runtime/composables'

const { userId, isAuthenticated, getProfile } = useUser<{ email: string, username: string }>()

onMounted(async () => {
  if (userId.value) {
    await getProfile(`/api/v1/accounts/${userId.value}`)
  }
})

async function refresh() {
  const { accessToken } = await useRefreshAccessToken()
  console.log('access', accessToken)
}
</script>
