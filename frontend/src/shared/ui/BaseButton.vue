<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
});

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--loading': loading, 'btn--disabled': disabled }
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="btn__spinner"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
    <span class="btn__content">
      <slot />
    </span>
  </button>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;
  gap: 0.5rem;
  line-height: 1.25;

  &__spinner {
    animation: spin 1s linear infinite;
    width: 1rem;
    height: 1rem;
  }

  &__content {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  // Sizes
  &--sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  &--md {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  &--lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  // Variants
  &--primary {
    background-color: $color-primary;
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: $color-primary-hover;
    }
  }

  &--secondary {
    background-color: $color-bg-muted;
    color: $color-text-main;
    border-color: $color-border;

    &:hover:not(:disabled) {
      background-color: #e2e8f0;
      border-color: $color-border-hover;
    }
  }

  &--outline {
    background-color: transparent;
    color: $color-primary;
    border-color: $color-primary;

    &:hover:not(:disabled) {
      background-color: $color-primary-light;
    }
  }

  &--ghost {
    background-color: transparent;
    color: $color-text-muted;

    &:hover:not(:disabled) {
      background-color: $color-bg-muted;
      color: $color-text-main;
    }
  }

  &--danger {
    background-color: $color-danger;
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
  }

  &--disabled,
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
