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
      country: 'armenia',
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
    errors.value = res.errors.filter(e => e.source.toLowerCase().includes('staff') || e.source.toLowerCase().includes('armenia'));
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

watch([specialization, employmentType, search], () => {
  loadData(true);
});

onMounted(() => {
  loadData(true);
});
</script>

<template>
  <div class="page-armenia">
    <header class="page-armenia__header">
      <div class="page-armenia__title-row">
        <h1 class="page-armenia__title">
          Вакансии в Армении 🇦🇲
        </h1>
        <span class="page-armenia__badge">IT & Разработка</span>
      </div>
      <p class="page-armenia__description">
        Вакансии Frontend Developer, Vue, React, TypeScript, Fullstack в Ереване, Гюмри и удаленно по Армении.
        Прямой парсинг Staff.am с автоматическим обновлением каждые 10 минут.
      </p>
    </header>

    <!-- Error Banner -->
    <ErrorBanner
      v-if="errors.length"
      :errors="errors"
      @retry="loadData(true)"
    />

    <!-- Filters -->
    <FilterBar
      v-model:specialization="specialization"
      v-model:employment-type="employmentType"
      v-model:search="search"
    />

    <!-- Vacancy List -->
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

.page-armenia {
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
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
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
