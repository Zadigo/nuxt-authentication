<template>
  <div>
    <!-- !user?.webauthn &&  -->
    <u-button v-if="supportsWebAuthn" size="sm" variant="subtle" color="neutral" @click="() => { toggleModal() }">
      Passkeys
    </u-button>

    <u-modal v-model:open="show" title="Login with credential" description="First time? Register your credential">
      <template #content>
        <div class="p-4">
          <form class="space-y-4" @submit.prevent="signUp">
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

          <form class="space-y-4" @submit.prevent="signIn">
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
  </div>
</template>

<script setup lang="ts">
import { useWebauthnAuthentication } from '#imports'

const userName = ref('')

const show = ref(false)
const toggleModal = useToggle(show)

const { supportsWebAuthn, authenticate, signup } = useWebauthnAuthentication()
</script>
