<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Home } from 'lucide-vue-next';
</script>

<template>
  <div class="page-not-found">
    <div class="page-not-found__card">
      <span class="page-not-found__code">404</span>
      <h2 class="page-not-found__title">
        Страница не найдена
      </h2>
      <p class="page-not-found__desc">
        Запрашиваемая страница перемещена или не существует.
      </p>
      <RouterLink
        to="/"
        class="page-not-found__btn"
      >
        <Home class="w-4 h-4" />
        <span>Вернуться на главную</span>
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;

.page-not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem 1rem;

  &__card {
    text-align: center;
    background-color: #ffffff;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    padding: 3rem 2rem;
    max-width: 480px;
    width: 100%;
    box-shadow: $shadow-sm;
  }

  &__code {
    font-size: 4rem;
    font-weight: 900;
    color: $color-primary;
    line-height: 1;
    display: block;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  &__desc {
    color: $color-text-muted;
    font-size: 0.9rem;
    margin: 0 0 1.5rem;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: $color-primary;
    color: #ffffff;
    padding: 0.6rem 1.25rem;
    border-radius: $radius-md;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background-color 0.15s ease-in-out;

    &:hover {
      background-color: $color-primary-hover;
    }
  }
}
</style>
