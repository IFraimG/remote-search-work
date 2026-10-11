<script setup lang="ts">
import { ref } from 'vue';
import { Vacancy } from '@/shared/types/index.js';
import VacancyCard from '@/entities/vacancy/ui/VacancyCard.vue';
import VacancySkeleton from '@/entities/vacancy/ui/VacancySkeleton.vue';
import BaseSpinner from '@/shared/ui/BaseSpinner.vue';
import { useInfiniteScroll } from '@/features/infinite-scroll/useInfiniteScroll.js';
import { SearchX, CheckCheck } from 'lucide-vue-next';

interface Props {
  vacancies: Vacancy[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'load-more'): void;
}>();

const sentinel = ref<HTMLElement | null>(null);

useInfiniteScroll(sentinel, {
  onLoadMore: () => emit('load-more'),
  hasMore: ref(props.hasMore),
  isLoading: ref(props.isLoadingMore),
  distance: 300,
});
</script>

<template>
  <div class="vacancy-list-container">
    <!-- Initial Loading State -->
    <div
      v-if="isLoading"
      class="vacancy-grid"
    >
      <VacancySkeleton
        v-for="i in 6"
        :key="i"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="vacancies.length === 0"
      class="vacancy-empty"
    >
      <div class="vacancy-empty__icon-box">
        <SearchX class="vacancy-empty__icon" />
      </div>
      <h3 class="vacancy-empty__title">
        Вакансии не найдены
      </h3>
      <p class="vacancy-empty__desc">
        По заданным фильтрам актуальных вакансий не найдено. Попробуйте сбросить фильтры поиска или запустить обновление парсеров.
      </p>
    </div>

    <!-- Vacancies List -->
    <div
      v-else
      class="vacancy-grid"
    >
      <VacancyCard
        v-for="vacancy in vacancies"
        :key="vacancy.id"
        :vacancy="vacancy"
      />
    </div>

    <!-- Infinite Scroll Sentinel & Loader -->
    <div
      ref="sentinel"
      class="vacancy-sentinel"
    >
      <div
        v-if="isLoadingMore"
        class="vacancy-sentinel__loading"
      >
        <BaseSpinner
          size="md"
          label="Загрузка следующих вакансий..."
        />
      </div>

      <div
        v-else-if="!hasMore && vacancies.length > 0"
        class="vacancy-sentinel__finished"
      >
        <CheckCheck class="w-4 h-4 text-emerald-600 inline" />
        <span>Вы просмотрели все найденные вакансии ({{ vacancies.length }})</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;

.vacancy-list-container {
  width: 100%;
}

.vacancy-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.vacancy-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  background-color: #ffffff;
  border: 1px dashed $color-border;
  border-radius: $radius-lg;
  text-align: center;

  &__icon-box {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background-color: $color-bg-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  &__icon {
    width: 1.75rem;
    height: 1.75rem;
    color: $color-text-light;
  }

  &__title {
    margin: 0 0 0.5rem;
    font-size: 1.15rem;
    font-weight: 600;
    color: $color-text-main;
  }

  &__desc {
    margin: 0;
    max-width: 420px;
    font-size: 0.875rem;
    color: $color-text-muted;
    line-height: 1.5;
  }
}

.vacancy-sentinel {
  padding: 2rem 0 1rem;
  display: flex;
  justify-content: center;
  align-items: center;

  &__loading {
    display: flex;
    justify-content: center;
  }

  &__finished {
    font-size: 0.875rem;
    color: $color-text-muted;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: $color-bg-muted;
    padding: 0.5rem 1rem;
    border-radius: $radius-full;
  }
}
</style>
