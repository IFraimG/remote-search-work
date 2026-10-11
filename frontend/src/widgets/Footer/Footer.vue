<script setup lang="ts">
import { Globe, Shield, RefreshCw } from 'lucide-vue-next';
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <div class="app-footer__grid">
        <!-- Col 1: About -->
        <div class="app-footer__col">
          <h4 class="app-footer__title">
            RemoteSearchWork
          </h4>
          <p class="app-footer__desc">
            Агрегатор актуальных вакансий для Сербии, Армении, удаленной работы по всей Европе, США и странам СНГ (Грузия, Армения, Узбекистан), а также вакансий курьеров.
          </p>
        </div>

        <!-- Col 2: Features -->
        <div class="app-footer__col">
          <h4 class="app-footer__title">
            Особенности
          </h4>
          <ul class="app-footer__list">
            <li class="app-footer__list-item">
              <RefreshCw class="w-3.5 h-3.5 text-sky-500" />
              Парсинг каждые 10 минут
            </li>
            <li class="app-footer__list-item">
              <Shield class="w-3.5 h-3.5 text-emerald-500" />
              Честные ошибки без фейковых данных
            </li>
            <li class="app-footer__list-item">
              <Globe class="w-3.5 h-3.5 text-indigo-500" />
              Прямой переход на сайты-источники
            </li>
          </ul>
        </div>

        <!-- Col 3: Regions -->
        <div class="app-footer__col">
          <h4 class="app-footer__title">
            Охват регионов
          </h4>
          <p class="app-footer__desc">
            Сербия (Poslovi Infostud), Армения (Staff.am), Европа и США (Remotive, WeWorkRemotely), СНГ (Хабр Карьера: Тбилиси, Ереван, Ташкент).
          </p>
        </div>
      </div>

      <div class="app-footer__bottom">
        <span>© 2026 RemoteSearchWork. Все права защищены.</span>
        <span>Архитектура: FSD (Feature-Sliced Design), Fastify, Vue 3.</span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/shared/styles/variables' as *;

.app-footer {
  background-color: #ffffff;
  border-top: 1px solid $color-border;
  padding: 3rem 1rem 2rem;
  margin-top: auto;

  &__container {
    max-width: 1280px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (min-width: 768px) {
      grid-template-columns: 2fr 1.5fr 1.5fr;
    }
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: $color-text-main;
    margin: 0 0 0.75rem;
  }

  &__desc {
    font-size: 0.8125rem;
    color: $color-text-muted;
    line-height: 1.6;
    margin: 0;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__list-item {
    font-size: 0.8125rem;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__bottom {
    padding-top: 1.5rem;
    border-top: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.775rem;
    color: $color-text-light;

    @media (min-width: 640px) {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
</style>
