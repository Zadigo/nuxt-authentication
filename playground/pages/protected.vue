<template>
  <section>
    <nuxt-container>
      <nuxt-card>
        <h1>Protected Page</h1>
        <p>You are logged in and can see this protected content.</p>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
const { $nuxtAuthentication } = useNuxtApp()

const user = useUser()
await $nuxtAuthentication(`/auth/v1/profile/${user.userId.value}`, { method: 'GET' })
</script>
