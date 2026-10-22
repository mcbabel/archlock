<script lang="ts">
  import { count } from "../stores/count";

  interface Props {
    start?: number;
    onchange?: (value: number) => void;
  }

  let { start = 0, onchange }: Props = $props();
</script>

<button onclick={() => onchange?.(start + $count)}>{start}</button>
