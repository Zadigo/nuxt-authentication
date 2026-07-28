<template>
  <section>
    <u-container>
      <u-card>
        <h1>Protected Page</h1>
        <p>You are logged in and can see this protected content.</p>
      </u-card>
    </u-container>
  </section>
</template>

<script lang="ts" setup>
const { $nuxtAuthentication } = useNuxtApp()
await $nuxtAuthentication(`/v1/accounts/profile`, { method: 'GET' })
</script>
