<script setup lang="ts">
import Header from '@/widgets/Header/Header.vue';
import Footer from '@/widgets/Footer/Footer.vue';
import CurrencyTicker from '@/widgets/CurrencyTicker/CurrencyTicker.vue';
</script>

<template>
  <div class="app-layout">
    <CurrencyTicker />
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
