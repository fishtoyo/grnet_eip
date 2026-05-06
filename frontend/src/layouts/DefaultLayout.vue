<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar />
    <main class="flex-1 p-8 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue';
</script>