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

const country = ref('europe_and_usa'); // combined Europe + USA + allowed CIS
const specialization = ref('all');
const employmentType = ref('all');
const search = ref('');

const targetCountries = [
  { code: 'europe_and_usa', label: '🌍 Все страны (Европа, США, СНГ)' },
  { code: 'usa', label: '🇺🇸 США (United States)' },
  { code: 'germany', label: '🇩🇪 Германия' },
  { code: 'uk', label: '🇬🇧 Великобритания' },
  { code: 'netherlands', label: '🇳🇱 Нидерланды' },
  { code: 'poland', label: '🇵🇱 Польша' },
  { code: 'france', label: '🇫🇷 Франция' },
  { code: 'spain', label: '🇪🇸 Испания' },
  { code: 'georgia', label: '🇬🇪 Грузия (СНГ)' },
  { code: 'armenia', label: '🇦🇲 Армения (СНГ)' },
  { code: 'uzbekistan', label: '🇺🇿 Узбекистан (СНГ)' },
  { code: 'global_remote', label: '🌐 Global Remote / Worldwide' },
];

const loadData = async (resetPage = true) => {
  if (resetPage) {
    currentPage.value = 1;
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }

  try {
    const res = await fetchVacancies({
      country: country.value,
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
    errors.value = res.errors.filter(e =>
      !e.source.toLowerCase().includes('kurir') && !e.source.toLowerCase().includes('dostavljac')
    );
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

watch([country, specialization, employmentType, search], () => {
  loadData(true);
});

onMounted(() => {
  loadData(true);
});
</script>

<template>
  <div class="page-remote">
    <header class="page-remote__header">
      <div class="page-remote__title-row">
        <h1 class="page-remote__title">
          Удаленная работа: Европа, США и СНГ 🌍
        </h1>
        <span class="page-remote__badge">Global Remote</span>
      </div>
      <p class="page-remote__description">
        Вакансии для Frontend, React, Vue, TypeScript, Fullstack и Node.js разработчиков с возможностью удаленной работы.
        Включает компании из США, всех европейских стран и стран СНГ (только Грузия, Армения, Узбекистан).
        Используйте фильтр по странам для точечного выбора.
      </p>
    </header>

    <!-- Error Banner -->
    <ErrorBanner
      v-if="errors.length"
      :errors="errors"
      @retry="loadData(true)"
    />

    <!-- Filter Bar with Country Switcher -->
    <FilterBar
      v-model:country="country"
      v-model:specialization="specialization"
      v-model:employment-type="employmentType"
      v-model:search="search"
      :show-country-filter="true"
      :countries-list="targetCountries"
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

.page-remote {
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
    background-color: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-full;
    font-size: 0.75rem;
    font-weight: 600;
  }

  &__description {
    margin: 0;
    font-size: 0.925rem;
    color: $color-text-muted;
    max-width: 820px;
    line-height: 1.5;
  }
}
</style>
