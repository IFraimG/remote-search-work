<script setup lang="ts">
import { computed } from 'vue';
import { Vacancy } from '@/shared/types/index.js';
import BaseBadge from '@/shared/ui/BaseBadge.vue';
import { ExternalLink, MapPin, Building, Briefcase, DollarSign, Clock } from 'lucide-vue-next';

interface Props {
  vacancy: Vacancy;
}

const props = defineProps<Props>();

const employmentTypeLabel = computed(() => {
  switch (props.vacancy.employmentType) {
    case 'remote':
      return 'Удаленно';
    case 'hybrid':
      return 'Гибрид';
    case 'office':
      return 'Офис / На месте';
    default:
      return props.vacancy.employmentType;
  }
});

const employmentBadgeVariant = computed(() => {
  switch (props.vacancy.employmentType) {
    case 'remote':
      return 'remote';
    case 'hybrid':
      return 'hybrid';
    case 'office':
      return 'office';
    default:
      return 'default';
  }
});

const formattedSalary = computed(() => {
  if (props.vacancy.salary.raw && props.vacancy.salary.raw !== 'Договорная') {
    return props.vacancy.salary.raw;
  }
  if (props.vacancy.salary.min || props.vacancy.salary.max) {
    const currency = props.vacancy.salary.currency || 'USD';
    if (props.vacancy.salary.min && props.vacancy.salary.max) {
      return `${props.vacancy.salary.min.toLocaleString()} - ${props.vacancy.salary.max.toLocaleString()} ${currency}`;
    }
    if (props.vacancy.salary.min) {
      return `от ${props.vacancy.salary.min.toLocaleString()} ${currency}`;
    }
    return `до ${props.vacancy.salary.max?.toLocaleString()} ${currency}`;
  }
  return 'По договоренности';
});
</script>

<template>
  <article class="vacancy-card">
    <!-- Header -->
    <header class="vacancy-card__header">
      <div class="vacancy-card__title-row">
        <h3 class="vacancy-card__title">
          <a
            :href="vacancy.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="vacancy-card__title-link"
          >
            {{ vacancy.title }}
            <ExternalLink class="vacancy-card__external-icon" />
          </a>
        </h3>

        <!-- Employment Type Badge -->
        <BaseBadge
          :variant="employmentBadgeVariant"
          class="vacancy-card__badge"
        >
          {{ employmentTypeLabel }}
        </BaseBadge>
      </div>

      <!-- Company & Location -->
      <div class="vacancy-card__meta">
        <span class="vacancy-card__meta-item">
          <Building class="vacancy-card__meta-icon" />
          {{ vacancy.company }}
        </span>
        <span class="vacancy-card__meta-item">
          <MapPin class="vacancy-card__meta-icon" />
          {{ vacancy.location }}
        </span>
        <span
          v-if="vacancy.experience"
          class="vacancy-card__meta-item"
        >
          <Briefcase class="vacancy-card__meta-icon" />
          {{ vacancy.experience }}
        </span>
      </div>
    </header>

    <!-- Salary Display -->
    <div class="vacancy-card__salary-block">
      <DollarSign class="vacancy-card__salary-icon" />
      <span class="vacancy-card__salary-text">{{ formattedSalary }}</span>
      <span
        v-if="vacancy.salary.currency && formattedSalary !== 'По договоренности'"
        class="vacancy-card__salary-currency"
      >
        ({{ vacancy.salary.currency }})
      </span>
    </div>

    <!-- Brief Description -->
    <p class="vacancy-card__description">
      {{ vacancy.description }}
    </p>

    <!-- Key Requirements -->
    <div
      v-if="vacancy.requirements && vacancy.requirements.length"
      class="vacancy-card__requirements"
    >
      <div class="vacancy-card__requirements-label">
        Требования:
      </div>
      <ul class="vacancy-card__requirements-list">
        <li
          v-for="(req, index) in vacancy.requirements.slice(0, 3)"
          :key="index"
          class="vacancy-card__requirements-item"
        >
          {{ req }}
        </li>
      </ul>
    </div>

    <!-- Tags -->
    <div
      v-if="vacancy.tags && vacancy.tags.length"
      class="vacancy-card__tags"
    >
      <BaseBadge
        v-for="tag in vacancy.tags.slice(0, 4)"
        :key="tag"
        size="sm"
        variant="default"
        class="vacancy-card__tag"
      >
        {{ tag }}
      </BaseBadge>
    </div>

    <!-- Footer -->
    <footer class="vacancy-card__footer">
      <div class="vacancy-card__source-info">
        <span class="vacancy-card__source-name">Источник: {{ vacancy.source }}</span>
        <span
          v-if="vacancy.scrapedAt"
          class="vacancy-card__time"
        >
          <Clock class="vacancy-card__time-icon" />
          Синхронизировано
        </span>
      </div>

      <a
        :href="vacancy.sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="vacancy-card__apply-btn"
      >
        <span>Перейти к вакансии</span>
        <ExternalLink class="vacancy-card__apply-icon" />
      </a>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;

.vacancy-card {
  @include card-base;

  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: #ffffff;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  position: relative;

  &__header {
    margin-bottom: 0.75rem;
  }

  &__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  &__title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.35;
  }

  &__title-link {
    color: $color-text-main;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: color 0.15s ease-in-out;

    &:hover {
      color: $color-primary;
    }
  }

  &__external-icon {
    width: 0.95rem;
    height: 0.95rem;
    opacity: 0.6;
    flex-shrink: 0;
  }

  &__badge {
    flex-shrink: 0;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.85rem;
    font-size: 0.875rem;
    color: $color-text-muted;
  }

  &__meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  &__meta-icon {
    width: 0.9rem;
    height: 0.9rem;
    color: $color-text-light;
  }

  &__salary-block {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: $radius-md;
    color: #15803d;
    font-size: 0.925rem;
    font-weight: 600;
    margin-bottom: 0.85rem;
    align-self: flex-start;
  }

  &__salary-icon {
    width: 1rem;
    height: 1rem;
  }

  &__salary-currency {
    font-size: 0.775rem;
    font-weight: 500;
    opacity: 0.85;
  }

  &__description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: #334155;
    margin: 0 0 1rem;

    @include line-clamp(3);
  }

  &__requirements {
    background-color: $color-bg-muted;
    border-radius: $radius-md;
    padding: 0.65rem 0.85rem;
    margin-bottom: 1rem;
    font-size: 0.8125rem;
  }

  &__requirements-label {
    font-weight: 600;
    color: $color-text-main;
    margin-bottom: 0.25rem;
  }

  &__requirements-list {
    margin: 0;
    padding-left: 1.15rem;
    color: $color-text-muted;
  }

  &__requirements-item {
    margin-bottom: 0.2rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-bottom: 1.25rem;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $color-border;
    margin-top: auto;
  }

  &__source-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.775rem;
    color: $color-text-light;
  }

  &__source-name {
    font-weight: 500;
    color: $color-text-muted;
  }

  &__time {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__time-icon {
    width: 0.75rem;
    height: 0.75rem;
  }

  &__apply-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    background-color: $color-primary;
    color: #ffffff;
    border-radius: $radius-md;
    font-size: 0.825rem;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.15s ease-in-out;
    white-space: nowrap;

    &:hover {
      background-color: $color-primary-hover;
    }
  }

  &__apply-icon {
    width: 0.85rem;
    height: 0.85rem;
  }
}
</style>
