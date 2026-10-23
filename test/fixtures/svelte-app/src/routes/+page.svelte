<script lang="ts">
  import { Counter } from "$lib";
  import Legacy from "$lib/components/Legacy.svelte";
  import Untyped from "$lib/components/Untyped.svelte";
</script>

<svelte:head>
  <script>
    import("./not-a-dependency.js");
  </script>
</svelte:head>

<Counter start={1} />
<Legacy title="Hello" />
<Untyped label="x" />
