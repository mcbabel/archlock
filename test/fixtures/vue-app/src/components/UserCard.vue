<script setup lang="ts">
import type { User } from "@/stores/users";

interface BaseProps {
  compact?: boolean;
}

interface Props extends BaseProps {
  user: User;
  readonly tags?: string[];
}

const props = withDefaults(defineProps<Props>(), { compact: false });
const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "close"): void;
}>();
const open = defineModel<boolean>("open", { required: true });
</script>

<template>
  <article :class="{ compact: props.compact }" @click="emit('select', props.user.id)">
    {{ props.user.name }}
  </article>
</template>
