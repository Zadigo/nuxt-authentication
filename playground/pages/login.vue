<template>
  <section class="my-20 space-y-2">
    <u-container class="max-w-2xl mx-auto">
      <u-card>
        <div class="space-y-4">
          <u-input v-model="usernameField" class="w-full" placeholder="Email" />
          <u-input v-model="password" class="w-full" placeholder="Password" />
          <u-button to="/">
            <icon name="i-lucide:arrow-left" />
            Home
          </u-button>
          <u-button @click="() => login()">
            <icon name="i-lucide:log-in" />
            Login
          </u-button>
        </div>
      </u-card>
    </u-container>
  </section>
</template>

<script lang="ts" setup>
const { usernameField, password, login } = useLogin('username')
</script>
