<template>
  <div id="nuxt-authentication-login">
    <slot :login="login" :can-be-submitted="canBeSubmitted" />
  </div>
</template>

<script lang="ts" setup>
import { syncRef } from '#imports'
import { useLogin } from '../composables'

const { userNameFieldName = 'username' } = defineProps<{
  userNameFieldName?: 'email' | 'username'
}>()

const { login, canBeSubmitted, usernameField: _userNameField, password: _password } = useLogin(userNameFieldName)

const usernameField = defineModel<string>('usernameField', { default: '', type: String })
const passwordField = defineModel<string>('passwordField', { default: '', type: String })

syncRef(_userNameField, usernameField, { direction: 'rtl' })
syncRef(_password, passwordField, { direction: 'rtl' })
</script>
