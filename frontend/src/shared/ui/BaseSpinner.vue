<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  label: '',
});
</script>

<template>
  <div class="spinner-container">
    <div :class="['spinner', `spinner--${size}`]" />
    <span
      v-if="label"
      class="spinner-label"
    >{{ label }}</span>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
}

.spinner {
  border: 3px solid $color-bg-muted;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  &--sm {
    width: 1.25rem;
    height: 1.25rem;
    border-width: 2px;
  }

  &--md {
    width: 2rem;
    height: 2rem;
  }

  &--lg {
    width: 3rem;
    height: 3rem;
    border-width: 4px;
  }
}

.spinner-label {
  font-size: 0.875rem;
  color: $color-text-muted;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
