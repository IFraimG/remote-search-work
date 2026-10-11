<script setup lang="ts">
interface Props {
  modelValue?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  type: 'text',
  disabled: false,
});

defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'clear'): void;
}>();
</script>

<template>
  <div class="input-field">
    <div class="input-field__icon-left">
      <slot name="left-icon" />
    </div>

    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-field__input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >

    <button
      v-if="modelValue"
      type="button"
      class="input-field__clear"
      title="Очистить"
      @click="$emit('update:modelValue', ''); $emit('clear')"
    >
      ×
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.input-field {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  &__icon-left {
    position: absolute;
    left: 0.75rem;
    display: flex;
    align-items: center;
    color: $color-text-light;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    padding: 0.55rem 2rem 0.55rem 2.25rem;
    font-size: 0.875rem;
    background-color: $color-bg-card;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-main;
    transition: all 0.15s ease-in-out;
    outline: none;

    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgb(2 132 199 / 0.15);
    }

    &::placeholder {
      color: $color-text-light;
    }

    &:disabled {
      background-color: $color-bg-muted;
      cursor: not-allowed;
    }
  }

  &__clear {
    position: absolute;
    right: 0.65rem;
    background: none;
    border: none;
    font-size: 1.125rem;
    color: $color-text-light;
    cursor: pointer;
    line-height: 1;
    padding: 0.2rem;

    &:hover {
      color: $color-text-main;
    }
  }
}
</style>
