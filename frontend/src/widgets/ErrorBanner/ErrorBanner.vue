<script setup lang="ts">
import { ref } from 'vue';
import { ScraperError } from '@/shared/types/index.js';
import { AlertOctagon, ChevronDown, ChevronUp, RefreshCw } from 'lucide-vue-next';

interface Props {
  errors: ScraperError[];
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Обнаружены ошибки при сборе данных с некоторых источников',
});

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

const isExpanded = ref(false);
</script>

<template>
  <div
    v-if="errors && errors.length"
    class="error-banner"
  >
    <div class="error-banner__header">
      <div class="error-banner__lead">
        <AlertOctagon class="error-banner__icon" />
        <div class="error-banner__info">
          <h4 class="error-banner__title">
            {{ title }}
          </h4>
          <p class="error-banner__subtitle">
            Не удалось получить свежие данные от {{ errors.length }} источник{{ errors.length > 1 ? 'ов' : 'а' }}.
            (По правилам платформы мы не отображаем моковые данные).
          </p>
        </div>
      </div>

      <div class="error-banner__actions">
        <button
          type="button"
          class="error-banner__retry-btn"
          @click="emit('retry')"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Повторить</span>
        </button>

        <button
          type="button"
          class="error-banner__toggle-btn"
          @click="isExpanded = !isExpanded"
        >
          <span>{{ isExpanded ? 'Скрыть детали' : 'Детали ошибок' }}</span>
          <component
            :is="isExpanded ? ChevronUp : ChevronDown"
            class="w-3.5 h-3.5"
          />
        </button>
      </div>
    </div>

    <!-- Collapsible Error Details -->
    <div
      v-if="isExpanded"
      class="error-banner__details"
    >
      <ul class="error-banner__list">
        <li
          v-for="(err, index) in errors"
          :key="index"
          class="error-banner__item"
        >
          <strong class="error-banner__source">{{ err.source }}:</strong>
          <span class="error-banner__message">{{ err.message }}</span>
          <span
            v-if="err.timestamp"
            class="error-banner__time"
          >
            ({{ new Date(err.timestamp).toLocaleTimeString() }})
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;

.error-banner {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: $radius-lg;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  color: #991b1b;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    @media (min-width: 640px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__lead {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  &__icon {
    width: 1.35rem;
    height: 1.35rem;
    color: #dc2626;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #991b1b;
  }

  &__subtitle {
    margin: 0;
    font-size: 0.8125rem;
    color: #b91c1c;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 2.1rem;

    @media (min-width: 640px) {
      margin-left: 0;
    }
  }

  &__retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    background-color: #ffffff;
    border: 1px solid #fca5a5;
    border-radius: $radius-md;
    font-size: 0.775rem;
    font-weight: 600;
    color: #b91c1c;
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: #fee2e2;
    }
  }

  &__toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.35rem 0.65rem;
    background: transparent;
    border: none;
    font-size: 0.775rem;
    font-weight: 500;
    color: #b91c1c;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #7f1d1d;
    }
  }

  &__details {
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px dashed #fca5a5;
  }

  &__list {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.8125rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__item {
    line-height: 1.4;
  }

  &__source {
    font-weight: 600;
    margin-right: 0.35rem;
  }

  &__time {
    font-size: 0.75rem;
    color: #b91c1c;
    margin-left: 0.35rem;
  }
}
</style>
