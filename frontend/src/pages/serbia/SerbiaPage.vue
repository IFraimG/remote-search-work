<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Vacancy, ScraperError } from '@/shared/types/index.js';
import { fetchVacancies } from '@/shared/api/client.js';
import FilterBar from '@/widgets/FilterBar/FilterBar.vue';
import VacancyList from '@/widgets/VacancyList/VacancyList.vue';
import ErrorBanner from '@/widgets/ErrorBanner/ErrorBanner.vue';

const vacancies = ref<Vacancy[]>([]);
const errors = ref<ScraperError[]>([]);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const hasMore = ref(false);
const currentPage = ref(1);

const specialization = ref('all');
const employmentType = ref('all');
const search = ref('');

const loadData = async (resetPage = true) => {
  if (resetPage) {
    currentPage.value = 1;
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }

  try {
    const res = await fetchVacancies({
      country: 'serbia',
      category: 'it',
      specialization: specialization.value,
      employmentType: employmentType.value,
      search: search.value,
      page: currentPage.value,
      limit: 12,
    });

    if (resetPage) {
      vacancies.value = res.data;
    } else {
      vacancies.value.push(...res.data);
    }

    hasMore.value = res.pagination.hasMore;
    errors.value = res.errors.filter(e => e.source.toLowerCase().includes('infostud') || e.source.toLowerCase().includes('serbia'));
  } catch (err: unknown) {
    errors.value = [
      {
        source: 'Сервер / Сеть',
        message: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      },
    ];
    if (resetPage) vacancies.value = [];
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const handleLoadMore = () => {
  if (hasMore.value && !isLoadingMore.value) {
    currentPage.value++;
    loadData(false);
  }
};

// Re-fetch whenever filters change
watch([specialization, employmentType, search], () => {
  loadData(true);
});

onMounted(() => {
  loadData(true);
});
</script>

<template>
  <div class="page-serbia">
    <header class="page-serbia__header">
      <div class="page-serbia__title-row">
        <h1 class="page-serbia__title">
          Вакансии в Сербии 🇷🇸
        </h1>
        <span class="page-serbia__badge">IT & Разработка</span>
      </div>
      <p class="page-serbia__description">
        Актуальные вакансии Frontend, Fullstack, Vue, React, Node.js разработчиков в Сербии (Белград, Нови-Сад, Ниш и удаленно).
        Парсинг с ведущих платформ (Poslovi Infostud) с автообновлением каждые 10 минут.
      </p>
    </header>

    <!-- Error Banner (Real error reporting, no mock fallbacks) -->
    <ErrorBanner
      v-if="errors.length"
      :errors="errors"
      @retry="loadData(true)"
    />

    <!-- Filter Bar -->
    <FilterBar
      v-model:specialization="specialization"
      v-model:employment-type="employmentType"
      v-model:search="search"
    />

    <!-- Vacancies List with Lazy Infinite Scroll -->
    <VacancyList
      :vacancies="vacancies"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      :has-more="hasMore"
      @load-more="handleLoadMore"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;

.page-serbia {
  width: 100%;

  &__header {
    margin-bottom: 1.5rem;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  &__title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 800;
    color: $color-text-main;
  }

  &__badge {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-full;
    font-size: 0.75rem;
    font-weight: 600;
  }

  &__description {
    margin: 0;
    font-size: 0.925rem;
    color: $color-text-muted;
    max-width: 800px;
    line-height: 1.5;
  }
}
</style>
