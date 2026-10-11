<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import BaseInput from '@/shared/ui/BaseInput.vue';
import BaseSelect from '@/shared/ui/BaseSelect.vue';

interface Props {
  specialization?: string;
  employmentType?: string;
  country?: string;
  search?: string;
  showCountryFilter?: boolean;
  countriesList?: Array<{ code: string; label: string }>;
  isCourierMode?: boolean;
}

withDefaults(defineProps<Props>(), {
  specialization: 'all',
  employmentType: 'all',
  country: 'all',
  search: '',
  showCountryFilter: false,
  countriesList: () => [],
  isCourierMode: false,
});

const emit = defineEmits<{
  (e: 'update:specialization', value: string): void;
  (e: 'update:employmentType', value: string): void;
  (e: 'update:country', value: string): void;
  (e: 'update:search', value: string): void;
}>();

const itSpecializations = [
  { label: 'Все специализации', value: 'all' },
  { label: 'Frontend Developer', value: 'Frontend Developer' },
  { label: 'React Developer', value: 'React Developer' },
  { label: 'Vue Developer', value: 'Vue Developer' },
  { label: 'Typescript Developer', value: 'Typescript Developer' },
  { label: 'JS Developer', value: 'JS Developer' },
  { label: 'Fullstack Developer', value: 'Fullstack Developer' },
  { label: 'Node.js Developer', value: 'Node.js Developer' },
  { label: 'Web Developer', value: 'Web Developer' },
];

const employmentTypes = [
  { label: 'Все форматы работы', value: 'all' },
  { label: 'Только удаленно (Remote)', value: 'remote' },
  { label: 'Гибридный формат', value: 'hybrid' },
  { label: 'Офис / На месте', value: 'office' },
];
</script>

<template>
  <div class="filter-bar">
    <!-- Top row: Search and Selects -->
    <div class="filter-bar__top">
      <div class="filter-bar__search">
        <BaseInput
          :model-value="search"
          placeholder="Поиск по названию, стеку, компании..."
          @update:model-value="emit('update:search', $event)"
        >
          <template #left-icon>
            <Search class="w-4 h-4" />
          </template>
        </BaseInput>
      </div>

      <!-- Country Filter (when enabled) -->
      <div
        v-if="showCountryFilter"
        class="filter-bar__select"
      >
        <BaseSelect
          :model-value="country"
          :options="countriesList.map(c => ({ value: c.code, label: c.label }))"
          placeholder=""
          @update:model-value="emit('update:country', $event)"
        />
      </div>

      <!-- Employment Type Filter -->
      <div class="filter-bar__select">
        <BaseSelect
          :model-value="employmentType"
          :options="employmentTypes"
          placeholder=""
          @update:model-value="emit('update:employmentType', $event)"
        />
      </div>
    </div>

    <!-- Bottom row: Quick Specialization Chips (for IT mode) -->
    <div
      v-if="!isCourierMode"
      class="filter-bar__chips"
    >
      <span class="filter-bar__chips-label">Специализация:</span>
      <div class="filter-bar__chips-scroll">
        <button
          v-for="spec in itSpecializations"
          :key="spec.value"
          type="button"
          class="filter-bar__chip"
          :class="{ 'filter-bar__chip--active': (specialization || 'all') === spec.value }"
          @click="emit('update:specialization', spec.value)"
        >
          {{ spec.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;

.filter-bar {
  background-color: #ffffff;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: $shadow-sm;

  &__top {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.85rem;

    @media (min-width: 640px) {
      grid-template-columns: 2fr 1fr;
    }

    @media (min-width: 1024px) {
      grid-template-columns: 3fr 1.5fr 1.5fr;
    }
  }

  &__search {
    width: 100%;
  }

  &__select {
    width: 100%;
  }

  &__chips {
    margin-top: 1rem;
    padding-top: 0.85rem;
    border-top: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  &__chips-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-text-muted;
    white-space: nowrap;
  }

  &__chips-scroll {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__chip {
    padding: 0.35rem 0.65rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border-radius: $radius-full;
    background-color: $color-bg-muted;
    border: 1px solid $color-border;
    color: $color-text-muted;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    white-space: nowrap;

    &:hover {
      background-color: #e2e8f0;
      color: $color-text-main;
    }

    &--active {
      background-color: $color-primary;
      color: #ffffff;
      border-color: $color-primary;

      &:hover {
        background-color: $color-primary-hover;
        color: #ffffff;
      }
    }
  }
}
</style>
