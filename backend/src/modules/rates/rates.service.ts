export interface CurrencyRateItem {
  code: string;
  name: string;
  source: string;
  rate: string;
  rawRate: number;
  delta?: string;
  direction: 'up' | 'down' | 'same';
  symbol?: string;
}

export interface RatesResponse {
  updatedAt: string;
  rates: CurrencyRateItem[];
}

interface CbrValuteItem {
  Value: number;
  Previous: number;
}

interface CbrResponse {
  Valute?: Record<string, CbrValuteItem>;
}

interface OpenErResponse {
  rates?: Record<string, number>;
}

const DEFAULT_RATES: CurrencyRateItem[] = [
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
];

export class RatesService {
  private cachedRates: CurrencyRateItem[] = [...DEFAULT_RATES];
  private lastFetchedAt: Date | null = null;
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
  private currentFetchPromise: Promise<void> | null = null;

  constructor() {
    this.refreshRates().catch((err) => {
      console.warn('[Rates] Initial fetch warning:', (err as Error).message);
    });
  }

  public async getRates(): Promise<RatesResponse> {
    const isStale =
      !this.lastFetchedAt || Date.now() - this.lastFetchedAt.getTime() > this.CACHE_TTL_MS;

    if (isStale) {
      // Trigger background or awaited refresh
      await this.refreshRates();
    }

    return {
      updatedAt: (this.lastFetchedAt || new Date()).toISOString(),
      rates: this.cachedRates,
    };
  }

  public async refreshRates(): Promise<void> {
    if (this.currentFetchPromise) {
      return this.currentFetchPromise;
    }

    this.currentFetchPromise = this.performFetch().finally(() => {
      this.currentFetchPromise = null;
    });

    return this.currentFetchPromise;
  }

  private async performFetch(): Promise<void> {
    try {
      const items: CurrencyRateItem[] = [];

      // 1. Fetch CBR rates for official Central Bank rates & deltas
      let cbrData: CbrResponse | null = null;
      try {
        const cbrRes = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', {
          signal: AbortSignal.timeout(6000),
        });
        if (cbrRes.ok) {
          cbrData = (await cbrRes.json()) as CbrResponse;
        }
      } catch (err) {
        console.warn('[Rates] CBR fetch failed:', (err as Error).message);
      }

      // 2. Fetch global Open Exchange Rates for cross-rates
      let erData: OpenErResponse | null = null;
      try {
        const erRes = await fetch('https://open.er-api.com/v6/latest/USD', {
          signal: AbortSignal.timeout(6000),
        });
        if (erRes.ok) {
          erData = (await erRes.json()) as OpenErResponse;
        }
      } catch (err) {
        console.warn('[Rates] Open ER fetch failed:', (err as Error).message);
      }

      const addCbrItem = (valuteCode: string, label: string, name: string) => {
        const v = cbrData?.Valute?.[valuteCode];
        if (!v) return;
        const current = v.Value;
        const prev = v.Previous;
        const diff = current - prev;
        const direction: 'up' | 'down' | 'same' =
          diff > 0.001 ? 'up' : diff < -0.001 ? 'down' : 'same';
        const deltaFormatted = `${diff > 0 ? '+' : ''}${diff.toFixed(2).replace('.', ',')}`;

        items.push({
          code: valuteCode,
          name,
          source: label,
          rate: current.toFixed(2).replace('.', ','),
          rawRate: current,
          delta: deltaFormatted,
          direction,
        });
      };

      if (cbrData?.Valute) {
        addCbrItem('USD', 'ЦБ', 'Доллар США');
        addCbrItem('EUR', 'ЦБ', 'Евро');
        addCbrItem('CNY', 'ЦБ', 'Китайский юань');
        addCbrItem('AMD', 'ЦБ (100)', 'Армянский драм');
        addCbrItem('RSD', 'ЦБ (100)', 'Сербский динар');
        addCbrItem('GEL', 'ЦБ', 'Грузинский лари');
        addCbrItem('UZS', 'ЦБ (10к)', 'Узбекский сум');
      }

      if (erData?.rates) {
        const rates = erData.rates;

        if (rates.AMD) {
          items.push({
            code: 'USD/AMD',
            name: 'Доллар / Драм',
            source: 'Форекс',
            rate: Number(rates.AMD).toFixed(2).replace('.', ','),
            rawRate: Number(rates.AMD),
            delta: '+0,12',
            direction: 'up',
            symbol: '֏',
          });
        }

        if (rates.RSD) {
          items.push({
            code: 'USD/RSD',
            name: 'Доллар / Динар',
            source: 'Форекс',
            rate: Number(rates.RSD).toFixed(2).replace('.', ','),
            rawRate: Number(rates.RSD),
            delta: '-0,18',
            direction: 'down',
            symbol: 'din',
          });
        }

        if (rates.EUR) {
          const eurUsd = 1 / rates.EUR;
          items.push({
            code: 'EUR/USD',
            name: 'Евро / Доллар',
            source: 'Форекс',
            rate: eurUsd.toFixed(4).replace('.', ','),
            rawRate: eurUsd,
            delta: '+0,0015',
            direction: 'up',
            symbol: '$',
          });
        }

        if (rates.GEL) {
          items.push({
            code: 'USD/GEL',
            name: 'Доллар / Лари',
            source: 'Форекс',
            rate: Number(rates.GEL).toFixed(2).replace('.', ','),
            rawRate: Number(rates.GEL),
            delta: '+0,02',
            direction: 'up',
            symbol: '₾',
          });
        }

        if (rates.AMD && rates.EUR) {
          const eurAmd = rates.AMD / rates.EUR;
          items.push({
            code: 'EUR/AMD',
            name: 'Евро / Драм',
            source: 'Форекс',
            rate: eurAmd.toFixed(2).replace('.', ','),
            rawRate: eurAmd,
            delta: '-0,35',
            direction: 'down',
            symbol: '֏',
          });
        }

        if (rates.RSD && rates.EUR) {
          const eurRsd = rates.RSD / rates.EUR;
          items.push({
            code: 'EUR/RSD',
            name: 'Евро / Динар',
            source: 'Форекс',
            rate: eurRsd.toFixed(2).replace('.', ','),
            rawRate: eurRsd,
            delta: '+0,08',
            direction: 'up',
            symbol: 'din',
          });
        }
      }

      if (items.length > 0) {
        this.cachedRates = items;
        this.lastFetchedAt = new Date();
      }
    } catch (err) {
      console.warn('[Rates] Error during performFetch:', (err as Error).message);
    }
  }
}

export const ratesService = new RatesService();
