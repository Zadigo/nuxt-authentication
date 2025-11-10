<template>
  <section>
    <nuxt-container>
      {{ a }}

      <nuxt-button to="/login">
        Login
      </nuxt-button>

      <nuxt-button to="/protected">
        Protected
      </nuxt-button>

      <nuxt-button @click="refresh">
        Refresh Access Token
      </nuxt-button>

      <nuxt-login>
        <template #default="{ login: login2 }">
          <nuxt-button @click="login2">
            Login via Slot
          </nuxt-button>
        </template>
      </nuxt-login>

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
const { userId, isAuthenticated, getProfile } = useUser()

onMounted(async () => {
  if (userId.value) {
    await getProfile(`/api/v1/accounts/${userId.value}`)
  }
})

const a = useState('isAuthenticated')

async function refresh() {
  const { access } = await refreshAccessTokenClient()
  console.log('access', access)
}
</script>
