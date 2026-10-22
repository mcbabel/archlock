<script lang="ts">
export interface ListOptions {
  dense: boolean;
}
</script>

<script setup lang="ts" generic="T extends { id: string }">
defineProps<{ items: T[]; options?: ListOptions }>();
defineEmits<{ pick: [item: T]; clear: [] }>();
</script>

<template>
  <ul><li v-for="item in items" :key="item.id" @click="$emit('pick', item)">{{ item.id }}</li></ul>
</template>
