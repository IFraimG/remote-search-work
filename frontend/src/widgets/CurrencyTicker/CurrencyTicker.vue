<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CurrencyRateItem } from '@/shared/types/index.js';
import { fetchCurrencyRates } from '@/shared/api/client.js';
import { ArrowUp, ArrowDown } from 'lucide-vue-next';

const rates = ref<CurrencyRateItem[]>([
  { code: 'USD', name: 'Доллар США', source: 'ЦБ', rate: '84,90', rawRate: 84.9, delta: '-0,51', direction: 'down' },
  { code: 'EUR', name: 'Евро', source: 'ЦБ', rate: '94,97', rawRate: 94.97, delta: '-0,50', direction: 'down' },
  { code: 'CNY', name: 'Китайский юань', source: 'ЦБ', rate: '12,67', rawRate: 12.67, delta: '-0,06', direction: 'down' },
  { code: 'AMD', name: 'Армянский драм (100)', source: 'ЦБ', rate: '23,46', rawRate: 23.46, delta: '-0,14', direction: 'down' },
  { code: 'RSD', name: 'Сербский динар (100)', source: 'ЦБ', rate: '81,26', rawRate: 81.26, delta: '-0,21', direction: 'down' },
  { code: 'GEL', name: 'Грузинский лари', source: 'ЦБ', rate: '32,70', rawRate: 32.7, delta: '+0,10', direction: 'up' },
  { code: 'UZS', name: 'Узбекский сум (10к)', source: 'ЦБ', rate: '71,50', rawRate: 71.5, delta: '-0,28', direction: 'down' },
  { code: 'USD/AMD', name: 'Доллар / Драм', source: 'Форекс', rate: '361,92', rawRate: 361.92, delta: '+0,12', direction: 'up', symbol: '֏' },
  { code: 'USD/RSD', name: 'Доллар / Динар', source: 'Форекс', rate: '104,75', rawRate: 104.75, delta: '-0,18', direction: 'down', symbol: 'din' },
  { code: 'EUR/USD', name: 'Евро / Доллар', source: 'Форекс', rate: '1,1205', rawRate: 1.1205, delta: '+0,0015', direction: 'up', symbol: '$' },
  { code: 'USD/GEL', name: 'Доллар / Лари', source: 'Форекс', rate: '2,60', rawRate: 2.6, delta: '+0,02', direction: 'up', symbol: '₾' },
  { code: 'EUR/AMD', name: 'Евро / Драм', source: 'Форекс', rate: '395,20', rawRate: 395.2, delta: '-0,35', direction: 'down', symbol: '֏' },
  { code: 'EUR/RSD', name: 'Евро / Динар', source: 'Форекс', rate: '117,30', rawRate: 117.3, delta: '+0,08', direction: 'up', symbol: 'din' },
]);

const lastUpdated = ref<string>('');
let intervalId: ReturnType<typeof setInterval> | null = null;

const loadRates = async () => {
  try {
    const res = await fetchCurrencyRates();
    if (res?.rates && res.rates.length > 0) {
      rates.value = res.rates;
      lastUpdated.value = res.updatedAt;
    }
  } catch (err) {
    console.warn('[CurrencyTicker] Failed to update rates:', (err as Error).message);
  }
};

onMounted(() => {
  loadRates();
  // Auto-refresh rates every 10 minutes (matching site cycle)
  intervalId = setInterval(loadRates, 10 * 60 * 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="rbc-ticker">
    <!-- Static Leading Badge (RBC-style label) -->
    <div class="rbc-ticker__brand">
      <span class="rbc-ticker__rhombus" />
      <span class="rbc-ticker__brand-badge">
        <span class="rbc-ticker__brand-text">КУРСЫ ВАЛЮТ</span>
      </span>
      <span class="rbc-ticker__divider" />
    </div>

    <!-- Infinite Scrolling Marquee Track -->
    <div class="rbc-ticker__viewport">
      <div class="rbc-ticker__track">
        <!-- Loop 1 -->
        <div class="rbc-ticker__group">
          <div
            v-for="(item, idx) in rates"
            :key="`r1-${item.code}-${idx}`"
            class="rbc-ticker__item"
            :title="`${item.name} (${item.code}) — Источник: ${item.source}`"
          >
            <span class="rbc-ticker__code">{{ item.code }}</span>
            <span class="rbc-ticker__source">{{ item.source }}</span>
            <span class="rbc-ticker__rate">{{ item.rate }}</span>
            <span
              v-if="item.delta"
              class="rbc-ticker__delta"
              :class="{
                'rbc-ticker__delta--up': item.direction === 'up',
                'rbc-ticker__delta--down': item.direction === 'down',
                'rbc-ticker__delta--same': item.direction === 'same',
              }"
            >
              <ArrowUp
                v-if="item.direction === 'up'"
                class="rbc-ticker__arrow"
              />
              <ArrowDown
                v-else-if="item.direction === 'down'"
                class="rbc-ticker__arrow"
              />
              <span>{{ item.delta }}</span>
            </span>
            <span class="rbc-ticker__separator">|</span>
          </div>
        </div>

        <!-- Loop 2 (duplicate for seamless loop) -->
        <div
          class="rbc-ticker__group"
          aria-hidden="true"
        >
          <div
            v-for="(item, idx) in rates"
            :key="`r2-${item.code}-${idx}`"
            class="rbc-ticker__item"
          >
            <span class="rbc-ticker__code">{{ item.code }}</span>
            <span class="rbc-ticker__source">{{ item.source }}</span>
            <span class="rbc-ticker__rate">{{ item.rate }}</span>
            <span
              v-if="item.delta"
              class="rbc-ticker__delta"
              :class="{
                'rbc-ticker__delta--up': item.direction === 'up',
                'rbc-ticker__delta--down': item.direction === 'down',
                'rbc-ticker__delta--same': item.direction === 'same',
              }"
            >
              <ArrowUp
                v-if="item.direction === 'up'"
                class="rbc-ticker__arrow"
              />
              <ArrowDown
                v-else-if="item.direction === 'down'"
                class="rbc-ticker__arrow"
              />
              <span>{{ item.delta }}</span>
            </span>
            <span class="rbc-ticker__separator">|</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rbc-ticker {
  display: flex;
  align-items: center;
  height: 34px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 11.5px;
  line-height: 1;
  overflow: hidden;
  user-select: none;
  position: relative;
  z-index: 40;

  &__brand {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    background-color: #ffffff;
    z-index: 2;
    flex-shrink: 0;
    box-shadow: 2px 0 6px -1px rgb(0 0 0 / 0.05);
  }

  &__rhombus {
    width: 9px;
    height: 9px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    transform: rotate(45deg);
    border-radius: 1.5px;
    flex-shrink: 0;
  }

  &__brand-badge {
    display: inline-flex;
    align-items: center;
    padding: 2.5px 7px;
    background-color: #1e293b;
    color: #ffffff;
    border-radius: 4px;
    font-weight: 700;
    letter-spacing: 0.03em;
    font-size: 10px;
  }

  &__divider {
    width: 1px;
    height: 14px;
    background-color: #cbd5e1;
    margin-left: 2px;
  }

  &__viewport {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
  }

  &__track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: marquee-scroll 45s linear infinite;

    &:hover {
      animation-play-state: paused;
    }
  }

  &__group {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 4px;
    white-space: nowrap;
    cursor: default;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.85;
    }
  }

  &__code {
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  &__source {
    color: #94a3b8;
    font-size: 10.5px;
    font-weight: 500;
  }

  &__rate {
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  &__delta {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: -0.02em;

    &--down {
      color: #dc2626; // RBC Red
    }

    &--up {
      color: #16a34a; // Green
    }

    &--same {
      color: #64748b;
    }
  }

  &__arrow {
    width: 10px;
    height: 10px;
    stroke-width: 2.5;
  }

  &__separator {
    color: #cbd5e1;
    margin: 0 8px 0 10px;
    font-weight: 300;
  }
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}
</style>
