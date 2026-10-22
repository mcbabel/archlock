<!-- <script setup>import Old from "./Old.vue"</script> -->
<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import ItemList from "@/components/ItemList.vue";
import UserCard from "@/components/UserCard.vue";
import { useUsers } from "./stores/users";

const users = useUsers();
const open = ref(false);
</script>

<template>
  <UserCard v-for="u in users" :key="u.id" :user="u" v-model:open="open" @select="open = true" />
  <ItemList :items="users" @pick="open = false" />
  <BaseButton label="Close" @click="open = false" />
</template>
