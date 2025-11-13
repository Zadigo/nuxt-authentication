<template>
  <section class="my-20 space-y-2">
    <nuxt-container class="max-w-2xl mx-auto">
      <p>User ID: {{ userId }}</p>
      <p>Authenticated: {{ isAuthenticated }}</p>

      <nuxt-card>
        <div class="space-y-4">
          <nuxt-input v-model="usernameField" class="w-full" placeholder="Email" />
          <nuxt-input v-model="password" class="w-full" placeholder="Password" />
          <nuxt-button to="/">
            <icon name="i-lucide:arrow-left" />
            Home
          </nuxt-button>
          <nuxt-button @click="() => login()">
            <icon name="i-lucide:log-in" />
            Login
          </nuxt-button>
        </div>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
const { usernameField, password, login } = useLogin('username')
const { userId, isAuthenticated } = useUser()
</script>
