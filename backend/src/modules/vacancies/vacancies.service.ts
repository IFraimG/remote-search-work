import {
  Vacancy,
  VacanciesQuery,
  PaginatedVacanciesResponse,
  ScraperStatus,
  ScraperError,
} from './types.js';
import { BaseScraper, createDefaultScrapers } from './scrapers/index.js';
import { config } from '../../config/env.js';

export class VacanciesService {
  private scrapers: BaseScraper[] = [];
  private vacanciesCache: Vacancy[] = [];
  private lastSyncedAt: Date = new Date();
  private nextSyncAt: Date = new Date(Date.now() + config.scraperIntervalMinutes * 60 * 1000);
  private errors: ScraperError[] = [];
  private isSyncing = false;

  constructor() {
    this.scrapers = createDefaultScrapers();
  }

  // Extensibility: allow registering new scrapers or categories at runtime
  registerScraper(scraper: BaseScraper): void {
    this.scrapers.push(scraper);
  }

  async syncAll(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    console.log(`[Scraper] Starting data synchronization across ${this.scrapers.length} scrapers...`);

    const collectedVacancies: Vacancy[] = [];
    const collectedErrors: ScraperError[] = [];

    // Run scrapers in parallel
    const results = await Promise.allSettled(this.scrapers.map((s) => s.execute()));

    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      const scraper = this.scrapers[i];

      if (res.status === 'fulfilled') {
        const { vacancies, error } = res.value;
        if (error) {
          collectedErrors.push(error);
        }
        if (vacancies && vacancies.length > 0) {
          collectedVacancies.push(...vacancies);
        }
      } else {
        const error: ScraperError = {
          source: scraper.name,
          message: `${scraper.name}: Scraper execution failed: ${res.reason}`,
          timestamp: new Date().toISOString(),
        };
        collectedErrors.push(error);
      }
    }

    // Deduplicate vacancies by sourceUrl or id
    const uniqueMap = new Map<string, Vacancy>();
    for (const item of collectedVacancies) {
      if (!uniqueMap.has(item.sourceUrl)) {
        uniqueMap.set(item.sourceUrl, item);
      }
    }

    this.vacanciesCache = Array.from(uniqueMap.values());
    this.errors = collectedErrors;
    this.lastSyncedAt = new Date();
    this.nextSyncAt = new Date(Date.now() + config.scraperIntervalMinutes * 60 * 1000);
    this.isSyncing = false;

    console.log(
      `[Scraper] Sync completed. Total vacancies: ${this.vacanciesCache.length}, Errors: ${this.errors.length}`
    );
  }

  getVacancies(query: VacanciesQuery): PaginatedVacanciesResponse {
    let filtered = [...this.vacanciesCache];

    // 1. Filter by category (e.g. 'it', 'courier')
    if (query.category) {
      filtered = filtered.filter((v) => v.category.toLowerCase() === query.category!.toLowerCase());
    }

    // 2. Filter by country
    if (query.country && query.country !== 'all') {
      const countryQuery = query.country.toLowerCase();

      if (countryQuery === 'europe_and_usa') {
        // European countries + USA + allowed CIS (Georgia, Armenia, Uzbekistan)
        filtered = filtered.filter(
          (v) =>
            v.country !== 'serbia' && // Serbia has its own page
            (v.country === 'usa' ||
              v.country === 'germany' ||
              v.country === 'uk' ||
              v.country === 'netherlands' ||
              v.country === 'poland' ||
              v.country === 'france' ||
              v.country === 'spain' ||
              v.country === 'georgia' ||
              v.country === 'uzbekistan' ||
              v.country === 'global_remote')
        );
      } else {
        filtered = filtered.filter((v) => v.country.toLowerCase() === countryQuery);
      }
    }

    // 3. Filter by specialization
    if (query.specialization && query.specialization !== 'all') {
      const specQuery = query.specialization.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.specialization.toLowerCase().includes(specQuery) ||
          v.title.toLowerCase().includes(specQuery) ||
          v.tags.some((t) => t.toLowerCase().includes(specQuery))
      );
    }

    // 4. Filter by employment type ('remote', 'hybrid', 'office')
    if (query.employmentType && query.employmentType !== 'all') {
      filtered = filtered.filter((v) => v.employmentType === query.employmentType);
    }

    // 5. Keyword search (title, company, description, requirements)
    if (query.search && query.search.trim().length > 0) {
      const q = query.search.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.company.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.requirements.some((r) => r.toLowerCase().includes(q))
      );
    }

    // Sort newest scraped / published first
    filtered.sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime());

    // Pagination
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 12));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      sourcesStatus: this.getSourcesStatus(),
      errors: this.errors,
      lastSyncedAt: this.lastSyncedAt.toISOString(),
      nextSyncAt: this.nextSyncAt.toISOString(),
    };
  }

  getSourcesStatus(): ScraperStatus[] {
    return this.scrapers.map((s) => s.getStatus());
  }

  getErrors(): ScraperError[] {
    return this.errors;
  }

  getSyncMeta() {
    return {
      lastSyncedAt: this.lastSyncedAt.toISOString(),
      nextSyncAt: this.nextSyncAt.toISOString(),
      intervalMinutes: config.scraperIntervalMinutes,
      totalCached: this.vacanciesCache.length,
      isSyncing: this.isSyncing,
    };
  }
}

// Export singleton instance
export const vacanciesService = new VacanciesService();
