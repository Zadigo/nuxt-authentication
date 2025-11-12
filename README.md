<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# Nuxt Authentication

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt Authentication is a simple module that proposes authentication functionalities for Nuxt applications that uses backends like Django
REST framework or Laravel Sanctum.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Login / Logout
- 🚠 &nbsp;Check Authentication Status
- 🌲 &nbsp;Fetch User Profile

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-authentication
```

Then add the `useNuxtAuthentication` composable to your `app.vue` file to ensure that the `isAuthenticated` global state is populated on app load:

```vue
<script lang="ts" setup>
const { hasToken, isAuthenticated } = useNuxtAuthentication()
</script>
```

```ts

That's it! You can now use Nuxt Authentication in your Nuxt app ✨

## Composables

### Checking for tokens

The `useNuxtAuthentication` composable can be used to check for the presence of authentication tokens:

```vue
<script lang="ts" setup>
const { hasToken, isAuthenticated } = useNuxtAuthentication()
</script>
```

> ![NOTE]
> The `hasToken` property indicates only if there is an access token present, while the cookie
> The `isAuthenticated` property indicates whether the user is authenticated or not based on whether the `isAuthenticated` state has been set to `true` or `false`.
> The presence of a token does not necessarily mean that the user is authenticated, as the token could be expired or invalid.

### Sending authenticated requests

To ensure that all of your requests are authenticated, you can use the `$nuxtAuthentication` helper:

```ts
const { $nuxtAuthentication } = useNuxtApp()
const response = await $nuxtAuthentication('/api/protected-endpoint', { method: 'GET' })
```

> [!NOTE]
> This helper automatically attaches the access token to the `Authorization` header of your requests and will also attempt to refresh the access token if it has expired
> if the refresh strategy is set to `renew`.

### Login

```vue
<script lang="ts" setup>
const { usernameField, password, login } = useLogin('username')
const { userId, isAuthenticated } = useUser()
</script>
```

`usernameField`

The name of the field to be used to send the username (or email) to the backend.

__Renderless component__

You can also use the `<nuxt-login>` renderless component to create a custom login wrapper for your own UI:

```vue
<template>
  <section>
    <nuxt-container>
      <nuxt-card>
        <nuxt-input v-model="username" placeholder="Email" />
        <nuxt-input v-model="password" placeholder="Password" />

        <nuxt-login v-model:username-field="username" v-model:password-field="password">
          <template #default="{ login: login }">
            <nuxt-button @click="() => login()">
              Login via Slot
            </nuxt-button>
          </template>
        </nuxt-login>
      </nuxt-card>
    </nuxt-container>
  </section>
</template>

<script lang="ts" setup>
const username = ref('')
const password = ref('')
</script>
```

### Logout

```vue
<template>
  <nuxt-button @click="useLogout">
    Logout
  </nuxt-button>
</template>
```

### Checking user state

You can check for the user state with the `useUser` composable:

```vue
<script lang="ts" setup>
const { userId, isAuthenticated, getProfile } = useUser()
</script>
```

`userId`

The unique identifier of the authenticated user parsed from the [JWT token](https://jwt.io/).

`isAuthenticated`

A boolean indicating whether the user is authenticated or not.

`getProfile(apiEndpoint: string)`

A helper function which can be used to the user profile from the given API endpoint and populates the user state.

## Module options

`enabled`

Enable or disable the module (default: `true`).

`refreshEndpoint`

The API endpoint to be used to refresh the access token (default: `/api/token/refresh`).

`accessEndpoint`

The API endpoint to be used to obtain a new access token (default: `/api/token/access`).

`login`:

The API endpoint to be used to log in (default: `/login`).

`loginRedirectPath`

The path to redirect the user to after a successful login (default: `/`).

`strategy`

The refresh strategy to be used when the access token expires (default: `renew`).

Possible values:

- `renew`: Attempt to refresh the access token using the refresh token.
- `fail`: Do not attempt to refresh the access token and consider the user as logged out.
- `redirect`: Redirect the user to the login page.

`bearerTokenType`

The type of the bearer token to be used in the `Authorization` header (default: `Token`).

`accessTokenName`

The name of the access token cookie (default: 'access').

`refreshTokenName`

The name of the refresh token cookie (default: 'refresh').

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
