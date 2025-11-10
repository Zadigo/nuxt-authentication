<template>
  <section class="my-20">
    <nuxt-container>
      <nuxt-card>
        <nuxt-input v-model="usernameField" placeholder="Email" />
        <nuxt-input v-model="password" placeholder="Password" />`
        <nuxt-button @click="login">Login</nuxt-button>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
const { usernameField, password, login } = useLogin()
</script>
