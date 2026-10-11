<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Vacancy, ScraperError } from '@/shared/types/index.js';
import { fetchVacancies } from '@/shared/api/client.js';
import FilterBar from '@/widgets/FilterBar/FilterBar.vue';
import VacancyList from '@/widgets/VacancyList/VacancyList.vue';
import ErrorBanner from '@/widgets/ErrorBanner/ErrorBanner.vue';
import { Bike } from 'lucide-vue-next';

const vacancies = ref<Vacancy[]>([]);
const errors = ref<ScraperError[]>([]);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const hasMore = ref(false);
const currentPage = ref(1);

const selectedCountry = ref('all'); // 'all', 'serbia', 'armenia'
const search = ref('');

const courierCountries = [
  { code: 'all', label: '🇷🇸 + 🇦🇲 Все страны (Сербия & Армения)' },
  { code: 'serbia', label: '🇷🇸 Сербия (Белград, Нови-Сад и др.)' },
  { code: 'armenia', label: '🇦🇲 Армения (Ереван, Гюмри и др.)' },
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
      country: selectedCountry.value,
      category: 'courier',
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
      e.source.toLowerCase().includes('kurir') ||
      e.source.toLowerCase().includes('courier') ||
      e.source.toLowerCase().includes('dostavljac')
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

watch([selectedCountry, search], () => {
  loadData(true);
});

onMounted(() => {
  loadData(true);
});
</script>

<template>
  <div class="page-courier">
    <header class="page-courier__header">
      <div class="page-courier__title-row">
        <h1 class="page-courier__title">
          Вакансии курьеров: Сербия & Армения
        </h1>
        <span class="page-courier__badge">
          <Bike class="w-3.5 h-3.5 inline mr-1" />
          Доставка & Логистика
        </span>
      </div>
      <p class="page-courier__description">
        Актуальные вакансии пеших, авто- и мото-курьеров в Сербии (Kurir / Dostavljač) и Армении (Delivery / առաքիչ).
        С зарплатами в RSD и AMD, требованиями к транспорту и прямыми контактами работодателей.
      </p>

      <!-- Quick Country Toggle Chips -->
      <div class="page-courier__country-toggle">
        <button
          v-for="c in courierCountries"
          :key="c.code"
          type="button"
          class="page-courier__toggle-btn"
          :class="{ 'page-courier__toggle-btn--active': selectedCountry === c.code }"
          @click="selectedCountry = c.code"
        >
          {{ c.label }}
        </button>
      </div>
    </header>

    <!-- Error Banner -->
    <ErrorBanner
      v-if="errors.length"
      :errors="errors"
      @retry="loadData(true)"
    />

    <!-- Filter Bar (in Courier mode, hides IT chips) -->
    <FilterBar
      v-model:search="search"
      :is-courier-mode="true"
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

.page-courier {
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
    color: #b45309;
    border: 1px solid #fde68a;
    padding: 0.2rem 0.65rem;
    border-radius: $radius-full;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
  }

  &__description {
    margin: 0 0 1.25rem;
    font-size: 0.925rem;
    color: $color-text-muted;
    max-width: 820px;
    line-height: 1.5;
  }

  &__country-toggle {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__toggle-btn {
    padding: 0.45rem 0.95rem;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: $radius-full;
    background-color: #ffffff;
    border: 1px solid $color-border;
    color: $color-text-muted;
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: $color-bg-muted;
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
