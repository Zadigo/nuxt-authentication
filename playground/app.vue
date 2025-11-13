<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { useNuxtAuthentication } from '../src/runtime/composables'

const { verify } = useNuxtAuthentication()
await verify('token', 'Token is invalid or expired')
</script>
