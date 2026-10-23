<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    label: { type: String, required: true },
    size: [String, Number],
    tags: { type: Array as PropType<string[]>, default: () => [] },
    "aria-label": String,
  },
  emits: ["click", "update:size"],
});
</script>

<template>
  <button @click="$emit('click')">{{ label }}</button>
</template>
