<script setup lang="ts">
import Header from '@/widgets/Header/Header.vue';
import Footer from '@/widgets/Footer/Footer.vue';
</script>

<template>
  <div class="app-layout">
    <Header />
    <main class="app-layout__main">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style lang="scss">
@use '@/app/styles/main.scss';
</style>
