<script setup lang="ts">
import { ref, computed } from 'vue';
import { Vacancy, TranslatedVacancyData } from '@/shared/types/index.js';
import BaseBadge from '@/shared/ui/BaseBadge.vue';
import { translateVacancyData } from '@/shared/api/client.js';
import {
  ExternalLink,
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  Clock,
  Languages,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-vue-next';

interface Props {
  vacancy: Vacancy;
}

const props = defineProps<Props>();

const isTranslating = ref(false);
const isFlipped = ref(false);
const translateError = ref<string | null>(null);
const translated = ref<TranslatedVacancyData | null>(null);

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

async function handleTranslate() {
  if (translated.value) {
    isFlipped.value = true;
    return;
  }

  isTranslating.value = true;
  translateError.value = null;

  try {
    const result = await translateVacancyData({
      title: props.vacancy.title,
      description: props.vacancy.description,
      requirements: props.vacancy.requirements,
      experience: props.vacancy.experience,
      location: props.vacancy.location,
    });

    translated.value = result;
    // Small timeout to allow render then trigger flip animation
    setTimeout(() => {
      isTranslating.value = false;
      isFlipped.value = true;
    }, 200);
  } catch (err: unknown) {
    isTranslating.value = false;
    translateError.value =
      err instanceof Error ? err.message : 'Не удалось перевести объявление. Попробуйте снова.';
  }
}

function handleFlipBack() {
  isFlipped.value = false;
}

function handleRetryTranslate() {
  translateError.value = null;
  handleTranslate();
}

function handleDismissError() {
  translateError.value = null;
}
</script>

<template>
  <div class="vacancy-card-perspective">
    <div
      class="vacancy-card-flipper"
      :class="{ 'vacancy-card-flipper--flipped': isFlipped }"
    >
      <!-- ================= FRONT FACE (Original) ================= -->
      <article
        class="vacancy-card vacancy-card--front"
        :class="{ 'vacancy-card--blurred': isTranslating || translateError }"
      >
        <!-- Loading Overlay during translation -->
        <div
          v-if="isTranslating"
          class="vacancy-card__overlay vacancy-card__overlay--loading"
        >
          <div class="vacancy-card__loader-content">
            <Loader2 class="vacancy-card__spinner-icon" />
            <span class="vacancy-card__loader-title">Переводим на русский язык</span>
            <span class="vacancy-card__loader-subtitle">Пожалуйста, подождите секунду...</span>
          </div>
        </div>

        <!-- Error Overlay if translation failed -->
        <div
          v-if="translateError"
          class="vacancy-card__overlay vacancy-card__overlay--error"
        >
          <div class="vacancy-card__error-content">
            <AlertCircle class="vacancy-card__error-icon" />
            <span class="vacancy-card__error-title">Ошибка перевода</span>
            <p class="vacancy-card__error-text">
              {{ translateError }}
            </p>
            <div class="vacancy-card__error-actions">
              <button
                type="button"
                class="vacancy-card__action-btn vacancy-card__action-btn--primary"
                @click="handleRetryTranslate"
              >
                Повторить
              </button>
              <button
                type="button"
                class="vacancy-card__action-btn vacancy-card__action-btn--ghost"
                @click="handleDismissError"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>

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

            <div class="vacancy-card__header-badges">
              <!-- Translate button on front -->
              <button
                type="button"
                class="vacancy-card__translate-btn"
                title="Перевести на русский язык"
                :disabled="isTranslating"
                @click="handleTranslate"
              >
                <Languages class="vacancy-card__translate-icon" />
                <span>Перевести</span>
              </button>

              <!-- Employment Type Badge -->
              <BaseBadge
                :variant="employmentBadgeVariant"
                class="vacancy-card__badge"
              >
                {{ employmentTypeLabel }}
              </BaseBadge>
            </div>
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

          <div class="vacancy-card__footer-actions">
            <button
              type="button"
              class="vacancy-card__footer-translate-btn"
              @click="handleTranslate"
            >
              <Languages class="vacancy-card__footer-translate-icon" />
              <span>На русский</span>
            </button>

            <a
              :href="vacancy.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="vacancy-card__apply-btn"
            >
              <span>К вакансии</span>
              <ExternalLink class="vacancy-card__apply-icon" />
            </a>
          </div>
        </footer>
      </article>

      <!-- ================= BACK FACE (Translated to Russian) ================= -->
      <article
        v-if="translated"
        class="vacancy-card vacancy-card--back"
      >
        <!-- Header -->
        <header class="vacancy-card__header">
          <div class="vacancy-card__title-row">
            <h3 class="vacancy-card__title vacancy-card__title--translated">
              <a
                :href="vacancy.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="vacancy-card__title-link"
              >
                {{ translated.title || vacancy.title }}
                <ExternalLink class="vacancy-card__external-icon" />
              </a>
            </h3>

            <div class="vacancy-card__header-badges">
              <!-- Translated pill badge -->
              <span class="vacancy-card__translated-badge">
                <CheckCircle2 class="vacancy-card__translated-icon" />
                <span>RU</span>
              </span>

              <!-- Flip Back button on top -->
              <button
                type="button"
                class="vacancy-card__flip-back-btn"
                title="Показать оригинал"
                @click="handleFlipBack"
              >
                <RotateCcw class="vacancy-card__flip-icon" />
                <span>Оригинал</span>
              </button>
            </div>
          </div>

          <!-- Company & Location (translated) -->
          <div class="vacancy-card__meta">
            <span class="vacancy-card__meta-item">
              <Building class="vacancy-card__meta-icon" />
              {{ vacancy.company }}
            </span>
            <span class="vacancy-card__meta-item">
              <MapPin class="vacancy-card__meta-icon" />
              {{ translated.location || vacancy.location }}
            </span>
            <span
              v-if="translated.experience || vacancy.experience"
              class="vacancy-card__meta-item"
            >
              <Briefcase class="vacancy-card__meta-icon" />
              {{ translated.experience || vacancy.experience }}
            </span>
          </div>
        </header>

        <!-- Salary Display (same data & currency) -->
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

        <!-- Description (translated to Russian) -->
        <p class="vacancy-card__description vacancy-card__description--translated">
          {{ translated.description || vacancy.description }}
        </p>

        <!-- Requirements (translated to Russian) -->
        <div
          v-if="(translated.requirements && translated.requirements.length) || (vacancy.requirements && vacancy.requirements.length)"
          class="vacancy-card__requirements"
        >
          <div class="vacancy-card__requirements-label">
            Требования (переведено):
          </div>
          <ul class="vacancy-card__requirements-list">
            <li
              v-for="(req, index) in (translated.requirements?.length ? translated.requirements : vacancy.requirements).slice(0, 3)"
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
            <span class="vacancy-card__source-name">Источник: {{ vacancy.source }} (Перевод)</span>
            <span class="vacancy-card__time">
              <CheckCircle2 class="vacancy-card__time-icon vacancy-card__time-icon--green" />
              Переведено на русский язык
            </span>
          </div>

          <div class="vacancy-card__footer-actions">
            <!-- Return to original button -->
            <button
              type="button"
              class="vacancy-card__return-btn"
              @click="handleFlipBack"
            >
              <RotateCcw class="vacancy-card__return-icon" />
              <span>Оригинал</span>
            </button>

            <a
              :href="vacancy.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="vacancy-card__apply-btn"
            >
              <span>К вакансии</span>
              <ExternalLink class="vacancy-card__apply-icon" />
            </a>
          </div>
        </footer>
      </article>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;

.vacancy-card-perspective {
  perspective: 1400px;
  width: 100%;
  height: 100%;
}

.vacancy-card-flipper {
  display: grid;
  grid-template-areas: 'card-slot';
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.65s cubic-bezier(0.35, 1.25, 0.45, 1);

  &--flipped {
    transform: rotateY(180deg);
  }
}

.vacancy-card {
  @include card-base;

  grid-area: card-slot;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: #ffffff;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  position: relative;
  backface-visibility: hidden;
  transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;

  &--front {
    transform: rotateY(0deg);
    z-index: 2;
  }

  &--back {
    transform: rotateY(180deg);
    background-color: #ffffff;
    border-color: #93c5fd;
    box-shadow: 0 4px 20px -2px rgb(59 130 246 / 0.12);
    z-index: 1;
  }

  &--blurred {
    & > *:not(.vacancy-card__overlay) {
      filter: blur(4px);
      pointer-events: none;
      user-select: none;
      transition: filter 0.2s ease-in-out;
    }
  }

  /* Overlay states */
  &__overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    backdrop-filter: blur(6px);
    animation: fade-in 0.2s ease-out;

    &--loading {
      background-color: rgb(255 255 255 / 0.82);
    }

    &--error {
      background-color: rgb(254 242 242 / 0.92);
      border: 1px solid #fecaca;
    }
  }

  &__loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.6rem;
  }

  &__spinner-icon {
    width: 2.25rem;
    height: 2.25rem;
    color: $color-primary;
    animation: spin 0.9s linear infinite;
  }

  &__loader-title {
    font-size: 1rem;
    font-weight: 700;
    color: $color-text-main;
  }

  &__loader-subtitle {
    font-size: 0.825rem;
    color: $color-text-muted;
  }

  &__error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    max-width: 280px;
  }

  &__error-icon {
    width: 2rem;
    height: 2rem;
    color: #ef4444;
  }

  &__error-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #b91c1c;
  }

  &__error-text {
    font-size: 0.8125rem;
    color: #7f1d1d;
    margin: 0;
    line-height: 1.4;
  }

  &__error-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }

  &__action-btn {
    padding: 0.4rem 0.85rem;
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: $radius-md;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease-in-out;

    &--primary {
      background-color: $color-primary;
      color: #ffffff;

      &:hover {
        background-color: $color-primary-hover;
      }
    }

    &--ghost {
      background-color: #ffffff;
      color: #64748b;
      border: 1px solid #cbd5e1;

      &:hover {
        background-color: #f1f5f9;
        color: #334155;
      }
    }
  }

  &__header {
    margin-bottom: 0.75rem;
  }

  &__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.85rem;
    margin-bottom: 0.5rem;
  }

  &__title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.35;
    flex: 1;

    &--translated {
      color: #1e3a8a;
    }
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

  &__header-badges {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  /* Translate button styles */
  &__translate-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: $radius-md;
    color: #2563eb;
    font-size: 0.775rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    white-space: nowrap;

    &:hover {
      background-color: #dbeafe;
      border-color: #93c5fd;
      color: #1d4ed8;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__translate-icon {
    width: 0.85rem;
    height: 0.85rem;
  }

  &__translated-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.55rem;
    background-color: #dcfce7;
    border: 1px solid #86efac;
    color: #15803d;
    border-radius: $radius-md;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  &__translated-icon {
    width: 0.8rem;
    height: 0.8rem;
  }

  &__flip-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: $radius-md;
    color: #475569;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: #e2e8f0;
      color: #0f172a;
    }
  }

  &__flip-icon {
    width: 0.75rem;
    height: 0.75rem;
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

    &--translated {
      color: #1e293b;
    }
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

    &--green {
      color: #16a34a;
      font-weight: 600;
    }
  }

  &__time-icon {
    width: 0.75rem;
    height: 0.75rem;

    &--green {
      color: #16a34a;
    }
  }

  &__footer-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__footer-translate-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.75rem;
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: $radius-md;
    color: #475569;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    white-space: nowrap;

    &:hover {
      background-color: #eff6ff;
      border-color: #93c5fd;
      color: #2563eb;
    }
  }

  &__footer-translate-icon {
    width: 0.85rem;
    height: 0.85rem;
  }

  &__return-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.75rem;
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: $radius-md;
    color: #334155;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    white-space: nowrap;

    &:hover {
      background-color: #e2e8f0;
      color: #0f172a;
    }
  }

  &__return-icon {
    width: 0.8rem;
    height: 0.8rem;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
