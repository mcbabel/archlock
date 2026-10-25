<script setup lang="ts">
import { useCart, type CartLine } from "~/composables/useCart";
import PriceTag from "@/components/PriceTag.vue";

defineProps<{ title: string; lines?: CartLine[] }>();
defineEmits<{ checkout: [total: string] }>();
const cart = useCart();
</script>

<template>
  <section>
    <h2>{{ title }}</h2>
    <PriceTag :value="cart.total()" />
    <!-- <NuxtLink> belongs to Nuxt: no file of this repository, no dependency. -->
    <NuxtLink to="/checkout">Checkout</NuxtLink>
  </section>
</template>
