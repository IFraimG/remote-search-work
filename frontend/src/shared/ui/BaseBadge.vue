<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'remote' | 'hybrid' | 'office';
  size?: 'sm' | 'md';
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
});
</script>

<template>
  <span
    :class="[
      'badge',
      `badge--${variant}`,
      `badge--${size}`
    ]"
  >
    <slot />
  </span>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  border-radius: $radius-full;
  line-height: 1;
  white-space: nowrap;

  &--sm {
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
  }

  &--md {
    padding: 0.3rem 0.65rem;
    font-size: 0.8125rem;
  }

  &--default {
    background-color: $color-bg-muted;
    color: $color-text-muted;
    border: 1px solid $color-border;
  }

  &--primary {
    background-color: $color-primary-light;
    color: $color-primary;
  }

  &--success {
    background-color: $color-success-light;
    color: $color-success;
  }

  &--warning {
    background-color: $color-warning-light;
    color: #b45309;
  }

  &--danger {
    background-color: $color-danger-light;
    color: $color-danger;
  }

  // Work type variants
  &--remote {
    background-color: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
  }

  &--hybrid {
    background-color: #f5f3ff;
    color: #6d28d9;
    border: 1px solid #ddd6fe;
  }

  &--office {
    background-color: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }
}
</style>
