<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useSyncTimer } from '@/features/sync-timer/useSyncTimer.js';
import { RefreshCw, Clock, ChevronRight, Menu, X } from 'lucide-vue-next';

const route = useRoute();
const { formattedCountdown, isRefreshing, handleRefresh } = useSyncTimer();
const isMobileMenuOpen = ref(false);

const navLinks = [
  { name: 'Сербия', to: '/serbia' },
  { name: 'Армения', to: '/armenia' },
  { name: 'Европа & США (Remote)', to: '/remote' },
  { name: 'Курьеры (RS / AM)', to: '/courier' },
];
</script>

<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- Brand Logo -->
      <RouterLink
        to="/"
        class="app-header__brand"
      >
        <span class="app-header__brand-icon">💼</span>
        <div class="app-header__brand-text">
          <span class="app-header__brand-title">RemoteSearch</span>
          <span class="app-header__brand-subtitle">RS · AM · EU · US</span>
        </div>
      </RouterLink>

      <!-- Desktop Navigation -->
      <nav class="app-header__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': route.path === link.to }"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <!-- Sync Status & Refresh Button -->
      <div class="app-header__actions">
        <!-- Live Timer Badge -->
        <div
          class="app-header__sync-timer"
          title="Данные синхронизируются автоматически каждые 10 минут"
        >
          <Clock class="app-header__sync-icon" />
          <span class="app-header__sync-label">Синхр.:</span>
          <span class="app-header__sync-value">{{ formattedCountdown }}</span>
        </div>

        <!-- Refresh Button -->
        <button
          type="button"
          class="app-header__refresh-btn"
          :class="{ 'app-header__refresh-btn--loading': isRefreshing }"
          :disabled="isRefreshing"
          title="Принудительно запустить парсеры"
          @click="handleRefresh"
        >
          <RefreshCw
            class="app-header__refresh-icon"
            :class="{ 'animate-spin': isRefreshing }"
          />
          <span class="app-header__refresh-text">Обновить</span>
        </button>

        <!-- Mobile Menu Toggle -->
        <button
          type="button"
          class="app-header__mobile-toggle"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <component
            :is="isMobileMenuOpen ? X : Menu"
            class="w-6 h-6"
          />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="app-header__mobile-menu"
    >
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="app-header__mobile-link"
        :class="{ 'app-header__mobile-link--active': route.path === link.to }"
        @click="isMobileMenuOpen = false"
      >
        <span>{{ link.name }}</span>
        <ChevronRight class="w-4 h-4 opacity-50" />
      </RouterLink>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid $color-border;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: $shadow-sm;

  &__container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0.85rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
    color: inherit;
  }

  &__brand-icon {
    font-size: 1.75rem;
    line-height: 1;
  }

  &__brand-text {
    display: flex;
    flex-direction: column;
  }

  &__brand-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: $color-primary;
    line-height: 1.2;
  }

  &__brand-subtitle {
    font-size: 0.725rem;
    color: $color-text-light;
    letter-spacing: 0.05em;
  }

  &__nav {
    display: none;
    align-items: center;
    gap: 0.5rem;

    @media (min-width: 768px) {
      display: flex;
    }
  }

  &__nav-link {
    padding: 0.45rem 0.85rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: $color-text-muted;
    text-decoration: none;
    border-radius: $radius-md;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: $color-text-main;
      background-color: $color-bg-muted;
    }

    &--active {
      color: $color-primary;
      background-color: $color-primary-light;
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__sync-timer {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: $color-bg-muted;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    padding: 0.3rem 0.65rem;
    font-size: 0.775rem;
    color: $color-text-muted;
  }

  &__sync-icon {
    width: 0.85rem;
    height: 0.85rem;
    color: $color-primary;
  }

  &__sync-label {
    display: none;

    @media (min-width: 640px) {
      display: inline;
    }
  }

  &__sync-value {
    font-weight: 600;
    font-family: monospace;
    color: $color-text-main;
  }

  &__refresh-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: #ffffff;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: 0.35rem 0.65rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: $color-text-main;
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover:not(:disabled) {
      background-color: $color-bg-muted;
      border-color: $color-border-hover;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__refresh-icon {
    width: 0.85rem;
    height: 0.85rem;
  }

  &__refresh-text {
    display: none;

    @media (min-width: 640px) {
      display: inline;
    }
  }

  &__mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    border-radius: $radius-md;
    border: 1px solid $color-border;
    background: transparent;
    cursor: pointer;

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__mobile-menu {
    border-top: 1px solid $color-border;
    padding: 0.5rem 1rem 1rem;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__mobile-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 0.75rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: $color-text-muted;
    text-decoration: none;
    border-radius: $radius-md;

    &:hover,
    &--active {
      color: $color-primary;
      background-color: $color-primary-light;
    }
  }
}
</style>
