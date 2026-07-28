<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { useNuxtAuthentication } from '../src/runtime/app/composables'

useNuxtAuthentication()
</script>
