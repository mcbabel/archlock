<script context="module" lang="ts">
  export const VERSION = 2;
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let title: string;
  export let count = 0;
  export const kind = "legacy";

  const dispatch = createEventDispatcher<{ save: { id: number }; reset: null }>();
</script>

<h1 on:click={() => dispatch("save", { id: count })}>{title}</h1>
