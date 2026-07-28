<template>
  <div id="nuxt-authentication-logout">
    <slot :logout="proxyLogout" />
  </div>
</template>

<script lang="ts" setup>
import { useLogout } from '../composables'

const emit = defineEmits<{ logout: [] }>()

async function proxyLogout(callback?: () => void) {
  await useLogout()
  callback?.()
  emit('logout')
}
</script>
