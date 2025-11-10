<template>
  <div id="nuxt-authentication-login">
    <slot :username-field="usernameField" :password="password" :login="login" :can-be-submitted="canBeSubmitted" />
  </div>
</template>

<script lang="ts" setup>
import { useLogin } from '../composables'

const { usernameField, password, login, canBeSubmitted } = useLogin('username')
</script>
