<script setup lang="ts">
</script>

<template>
  <div class="vacancy-skeleton">
    <div class="vacancy-skeleton__header">
      <div class="vacancy-skeleton__title animate-pulse" />
      <div class="vacancy-skeleton__badge animate-pulse" />
    </div>
    <div class="vacancy-skeleton__meta animate-pulse" />
    <div class="vacancy-skeleton__salary animate-pulse" />
    <div class="vacancy-skeleton__desc animate-pulse" />
    <div class="vacancy-skeleton__desc animate-pulse" />
    <div class="vacancy-skeleton__footer">
      <div class="vacancy-skeleton__source animate-pulse" />
      <div class="vacancy-skeleton__btn animate-pulse" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;

.vacancy-skeleton {
  @include card-base;

  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  &__title {
    height: 1.5rem;
    width: 60%;
    background-color: #e2e8f0;
    border-radius: $radius-sm;
  }

  &__badge {
    height: 1.25rem;
    width: 5rem;
    background-color: #e2e8f0;
    border-radius: $radius-full;
  }

  &__meta {
    height: 1rem;
    width: 45%;
    background-color: #f1f5f9;
    border-radius: $radius-sm;
  }

  &__salary {
    height: 1.75rem;
    width: 35%;
    background-color: #f1f5f9;
    border-radius: $radius-md;
  }

  &__desc {
    height: 0.875rem;
    width: 90%;
    background-color: #f1f5f9;
    border-radius: $radius-sm;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid $color-border;
  }

  &__source {
    height: 0.875rem;
    width: 30%;
    background-color: #f1f5f9;
    border-radius: $radius-sm;
  }

  &__btn {
    height: 1.85rem;
    width: 7rem;
    background-color: #e2e8f0;
    border-radius: $radius-md;
  }
}
</style>
