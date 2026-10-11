<script setup lang="ts">
interface Option {
  value: string;
  label: string;
}

interface Props {
  modelValue?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Выберите...',
  disabled: false,
});

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="select-field">
    <select
      :value="modelValue"
      :disabled="disabled"
      class="select-field__input"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-if="placeholder"
        value=""
      >
        {{ placeholder }}
      </option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.select-field {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  &__input {
    width: 100%;
    padding: 0.55rem 2rem 0.55rem 0.75rem;
    font-size: 0.875rem;
    background-color: $color-bg-card;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-main;
    transition: all 0.15s ease-in-out;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.65rem center;
    background-size: 1rem;

    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgb(2 132 199 / 0.15);
    }

    &:disabled {
      background-color: $color-bg-muted;
      cursor: not-allowed;
    }
  }
}
</style>
