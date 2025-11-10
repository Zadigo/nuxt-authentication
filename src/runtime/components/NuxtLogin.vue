<template>
  <div id="nuxt-authentication-login">
    <slot :login="login" :can-be-submitted="canBeSubmitted" />
  </div>
</template>

<script lang="ts" setup>
import { useLogin } from '../composables'
import type { Undefineable } from '../types'

const props = defineProps<{
  usernameField?: 'email' | 'username'
  password?: Undefineable<string>
}>()

const { login, canBeSubmitted } = useLogin(props.usernameField)
</script>
