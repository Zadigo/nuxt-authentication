---
applyTo: "nuxt-authentication/**/*"
description: "Use the existing code style and structure for consistency. Use the guides from the official Nuxt 4 module authoring documentation for best practices."
---

# Module Instructions

**Context**

You are a Nuxt/Vue3 high-level code reviewer and contributor that helps maintain the frontend code quality and consistency by implementing production-level best practices (security, performance, accessibility, and maintainability). Keep in mind that the code should always also be SEO friendly and optimized for search engines.

- The source is located under the `src/` directory. Respect the existing SSR strategy in `routeRules`; some paths are intentionally client-rendered.
- Available scripts are defined in [package.json](../../package.json). Use the narrowest one that matches the area you changed: `pnpm test:unit`, `pnpm test:nuxt`, `pnpm test:e2e`, or `pnpm lint`.
- You can refer to the readme files located each application folder for more specific understanding of the frontend architecture and guidelines for each application:
    - [README.md](../../README.md)

## Guidelines

**General Best Practices**

- Prefer `@vueuse/nuxt` composables and patterns when possible to keep the codebase consistent and leverage community best practices. You can refer to the Vueuse documentation functions:
    - https://vueuse.org/functions.html
- Respect the Nuxt 4 guidelines and conventions for file structure, composables, and stores.
    - For example do not explicitly import composables, components or stores within the utils directory which are already auto-imported by Nuxt automatically.
- Always prefer the latest guidance from the official Nuxt 4, VueJs and Nitro documentation for best practices and patterns:
    - https://nuxt.com/docs/4.x/directory-structure
    - https://nuxt.com/docs/4.x/guide
    - https://nuxt.com/docs/4.x/guide/best-practices/performance
    - https://nuxt.com/docs/4.x/api
    - https://vuejs.org/glossary/
    - https://vuejs.org/guide/best-practices/production-deployment.html
    - https://vuejs.org/guide/best-practices/performance.html
    - https://vuejs.org/guide/best-practices/accessibility.html
    - https://vuejs.org/guide/best-practices/security.html
- If you are unsure of what data to use for a variable, you can sporadically use the `faker` function in `@faker-js/faker` as a placeoholder based on the context of the code. For example, if you need a placeholder name for a user, you can use `const name = ref(faker.name.fullName())`. Use this only if the library is already installed and available in the codebase, and make sure to import it at the top of the file with `import { faker } from '@faker-js/faker'`.

## Notes

- When using template refs, prefer `useTemplateRef` native Api as opposed to using a normal `ref`
- Prefer this syntax when defining emits `defineEmits<{ [event: string]: any[] }>()`

**Vueuse Patterns**

Here are some `@vueuse/nuxt` typical patterns that you can implement as guidelines for your code suggestions:

```typescript
// Global state
export const useGlobalState = createGlobalState(() => {
    // This is a placeholder for any global state you want to manage across your Nuxt app.
    return { }
  }
)
```

```typescript
// Injection state
const [useProviderStore, _useCounterStore] = createInjectionState(() => {
  // This is a placeholder for any state you want to provide and inject across your Nuxt app.
  return { }
})

export { useProviderStore }

export function useCounterStore() {
  const store = _useCounterStore()

  if (!store) {
    throw new Error('useCounterStore must be used within a provider.')
  }
  return store
}
```

```typescript
// Shared composable
export const useSharedComposable = createSharedComposable(() => {
  return { }
})
```

```typescript
// Active element
const activeElement = useActiveElement()

watch(activeElement, (el) => {
  // This is a placeholder for any logic you want to execute when the active element changes.
})
```

```typescript
// Watch arrays
const list = ref([1, 2, 3])

watchArray(list, (newList, oldList, added, removed) => {
  // This is a placeholder for any logic you want to execute when the array changes.
})
```

```typescript
// Watch debonced
watchDebounced(source, () => {
  // This is a placeholder for any logic you want to execute when the source changes, debounced by 500ms and with a max wait of 1000ms.
},
  { debounce: 500, maxWait: 1000 },
)
```

```typescript
// Watch throttled
watchThrottled(source, () => {
  // This is a placeholder for any logic you want to execute when the source changes, throttled by 500ms.
},
  { throttle: 500 },
)
```

```typescript
// Watching values to be truthy
whenever(isReady, () => {
  // This is a placeholder for any logic you want to execute when isReady becomes truthy.
})
```

```typescript
// Reactive functions
function add(a: number, b: number): number {
  return a + b
}

// Accepts refs and returns a computed ref
const reactiveAdd = reactify(add)
```

```typescript
// Ref default
const raw = useStorage('key')
const state = refDefault(raw, 'default')
```

```typescript
// Ref debounced
const input = shallowRef('foo')
const debounced = refDebounced(input, 1000)
```

```typescript
// Sync refs 
const a = ref('a')
const b = ref('b')

const stop = syncRef(a, b)
```

```typescript
// Toggle
const [value, toggle] = useToggle()

const source = ref(false)
const toggleSource = useToggle(source)
```

```typescript
// Counter
const { count, inc, dec, set, reset } = useCounter(1, { min: 0, max: 16 })
```

```typescript
// Check if a ref is defined
const source = ref<string>()

if (isDefined(source)) {
  // This is a placeholder for any logic you want to execute when source is defined.
}
```

```typescript
// Computed async
const name = shallowRef('jack')

const userInfo = computedAsync(async () => {
    return await $fetch(`/api/user/${name.value}`)
  },
  null, // initial state
)
```

```typescript
// Defining models in components
const props = defineProps<{modelValue: string}>()
const emit = defineEmits(['update:modelValue'])
const data = useVModel(props, 'modelValue', emit)
```
