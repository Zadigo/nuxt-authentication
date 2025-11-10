<template>
  <div id="nuxt-authentication-logout">
    <slot :logout="proxyLogout" />
  </div>
</template>

<script lang="ts" setup>
import { defineEmits } from 'vue'
import { useLogout } from '../composables'

const emit = defineEmits<{ logout: [] }>()

async function proxyLogout(callback?: () => void) {
  await useLogout()
  callback?.()
  emit('logout')
}
</script>
