<script setup lang="ts">
defineProps<{ value: string }>();
</script>

<template>
  <span class="price">{{ value }}</span>
</template>
