<template>
  <section>
    <nuxt-container>
      <nuxt-card>
        <nuxt-input v-model="username" placeholder="Email" />
        <nuxt-input v-model="password" placeholder="Password" />

        <nuxt-login v-model:username-field="username" v-model:password-field="password">
          <template #default="{ login: login2 }">
            <nuxt-button @click="() => login2()">
              Login via Slot
            </nuxt-button>
          </template>
        </nuxt-login>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
import NuxtLogin from '../../src/runtime/components/NuxtLogin.vue'

const username = ref('')
const password = ref('')
</script>
