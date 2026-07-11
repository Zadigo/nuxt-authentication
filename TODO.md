## Architecture

* [ ] Change the architecture to BFF (Backend For Frontend) architecture, where the Nuxt app acts as a BFF for the API. This means that the Nuxt app will handle all API requests and responses, and the API will only be responsible for serving data. This will allow for better separation of concerns and easier maintenance.
* [ ] Address security concerns by handling the tokens only on the server side, and not exposing them to the client. This will prevent XSS attacks and other security vulnerabilities.

## Typescript 7.0 Breaking Changes

* [ ] TypeScript 7.0 is Microsoft's new native Go-rewrite of the compiler (GA'd July 8, 2026), and it ships without a JS programmatic API. There's no `convertCompilerOptionsFromJson`, no compiler API surface at all in the typescript package anymore — that's intentional; the stable API isn't coming back until TypeScript 7.1 (expected ~October 2026). nuxt-module-build/nuxi prepare/vue-tsc still call into the old JS compiler API to generate types, so they break immediately on 7.0.
