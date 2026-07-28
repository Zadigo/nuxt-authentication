<template>
  <section class="my-20 max-w-7xl mx-auto space-y-2">
    <!-- Header -->
    <u-page-header title="Web Authentication" />

    <!-- !user?.webauthn &&  -->
    <u-button v-if="supportsWebAuthn" size="sm" variant="subtle" color="neutral" @click="() => { toggleModal() }">
      Passkeys
    </u-button>

    <u-page-body>
      <!-- Grid -->
      <u-page-grid>
        <u-page-card :ui="{ leadingIcon: 'text-neutral' }" class="bg-slate-50">
          <icon name="i-fa7-brands-apple" size="30" />
          <nuxt-link to="/auth/apple" class="text-2xl font-light">Apple</nuxt-link>
        </u-page-card>
        <u-page-card :ui="{ leadingIcon: 'text-neutral' }" class="bg-slate-50">
          <icon name="i-fa7-brands-google" size="30" />
          <nuxt-link to="/auth/google" class="text-2xl font-light">Google</nuxt-link>
        </u-page-card>
      </u-page-grid>

      <!-- Modals -->
      <u-modal v-model:open="show" title="Login with credential" description="First time? Register your credential">
        <template #content>
          <div class="p-4">
            <form class="space-y-4" @submit.prevent="signup">
              <u-form-field label="Email" required>
                <u-input v-model="userName" name="email" type="email" />
              </u-form-field>
  
              <!-- <u-form-field label="Name" class="mt-4">
                <u-input v-model="displayName" name="name" type="text" />
              </u-form-field>
              
              <u-form-field label="Company" class="mt-4">
                <u-input v-model="company" name="name" type="text" />
              </u-form-field>
              
              <u-button type="submit" :disabled="!userName" color="neutral" class="mt-4">
                Register
              </u-button> -->
            </form>
  
            <u-separator label="Or" class="my-4" />
  
            <form class="space-y-4" @submit.prevent="signin">
              <u-form-field label="Email" required>
                <u-input v-model="userName" name="email" type="email" autocomplete="username webauthn" />
              </u-form-field>
  
              <u-button type="submit" color="neutral" class="mt-4">
                Authenticate
              </u-button>
            </form>
          </div>
        </template>
      </u-modal>
    </u-page-body>

  </section>
</template>

<script setup lang="ts">
import { useWebauthnAuthentication } from '#imports'

const userName = ref('')

const show = ref(false)
const toggleModal = useToggle(show)

const { supportsWebAuthn, authenticate, register } = useWebauthnAuthentication()

function signup() {
  register({ userName: userName.value })
}

function signin() {
  authenticate(userName)
}
</script>
