---
"archlock": minor
---

Vue, Svelte and Astro components.

- `.vue`, `.svelte` and `.astro` files are read through their script blocks (Vue `<script>` and `<script setup>`, Svelte instance and module scripts, Astro frontmatter and client scripts), so imports from and to components are dependency edges.
- A component is a public symbol of its module, named after its file (`class UserCard(VueComponent):`). Its props and events are its signature: `defineProps`, `withDefaults`, `defineEmits`, `defineModel`, the Options API, Svelte 5 `$props()`, Svelte 4 `export let` and typed `createEventDispatcher`, and Astro's `Props`. Generic components keep their type parameters.
- SvelteKit's `$lib` and Nuxt's `~`, `@`, `~~` and `@@` aliases resolve without the generated tsconfig files.
- `push` tells the agent how to read component sketches and suggests a fitting `verifyCommands` entry (`npx vue-tsc --noEmit`, `npx svelte-check`, `npx astro check`).

Also fixed:

- In a module without an entry, a name defined in several files is now qualified with each file's path (`ui_button_button__Button`) instead of keeping only the first one. Projects with such modules see these symbols as changes on the first `check` after upgrading; run `archlock accept` once to adopt the new names.
- Property names that are TypeScript keywords keep their spacing: `z.infer<typeof schema>` is `z.infer[typeof schema]`, not `z.infer [typeof schema]`. Existing sketches with the extra space still pass `check`; `archlock accept` rewrites them.
