<template>
  <section>
    <u-container>
      <u-card>
        <u-input v-model="username" placeholder="Email" />
        <u-input v-model="password" placeholder="Password" />

        <u-login v-model:username-field="username" v-model:password-field="password">
          <template #default="{ login: login2 }">
            <u-button @click="() => login2()">
              Login via Slot
            </u-button>
          </template>
        </u-login>
      </u-card>
    </u-container>
  </section>
</template>

<script lang="ts" setup>
import NuxtLogin from '../../src/runtime/components/NuxtLogin.vue'

const username = ref('')
const password = ref('')
</script>
