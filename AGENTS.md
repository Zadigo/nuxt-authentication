# AGENTS.md

## Scope

These instructions apply to the whole workspace. Use them with the path-scoped files in `.github/instructions/`.

## Repository Shape

- This repository contains all the code for creating a Nuxt 4 module.
    - [src/](src/) contains the module source code.
    - [tests/](tests/) contains the test cases for the module.
    - [package.json](package.json) defines the module's dependencies and scripts.
    - [README.md](README.md) provides an overview of the module and its usage.

## First References

- Start with [README.md](README.md) for the product overview and high-level architecture.

## Working Commands

- Tests: `pnpm run test`
- Linting: `pnpm run lint`
- Building: `pnpm run build`
- Development: `pnpm run dev`

## Repo Conventions

- Follow the existing code style and structure for consistency.
- Use the guides from the official Nuxt 4 module authoring documentation for best practices.
    - https://nuxt.com/docs/4.x/guide/modules/getting-started
    - https://nuxt.com/docs/4.x/guide/modules/module-anatomy
    - https://nuxt.com/docs/4.x/guide/modules/recipes-basics
    - https://nuxt.com/docs/4.x/guide/modules/recipes-advanced
    - https://nuxt.com/docs/4.x/guide/modules/testing
    - https://nuxt.com/docs/4.x/guide/modules/best-practices
    - https://nuxt.com/docs/4.x/guide/modules/ecosystem

## Validation Strategy

- Prefer focused validation from the touched area before running broad suites.
