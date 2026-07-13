<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { useNuxtAuthentication } from '../src/runtime/composables'

useNuxtAuthentication()
</script>
