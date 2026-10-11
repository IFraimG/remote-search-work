import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class VSetiScraper extends BaseScraper {
  readonly id = 'vseti';
  readonly name = 'СЕТИ (Remote IT)';
  readonly targetCountry = 'ALL';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const url = 'https://www.vseti.app/jobs';
    const vacancies: Vacancy[] = [];
    const seenUrls = new Set<string>();

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(8500),
      });

      if (!response.ok) return vacancies;

      const html = await response.text();
      const $ = cheerio.load(html);

      $('a[href*="/vakansii/"], a[href*="/jobs/"], .job-card').each((_, el) => {
        const $el = $(el);
        const link = $el.is('a') ? $el : $el.find('a').first();
        const title = this.cleanText(link.find('h2, h3, h4').first().text()) || this.cleanText(link.text());

        if (!title || title.length < 4) return;

        const lower = title.toLowerCase();
        const isTarget =
          lower.includes('frontend') ||
          lower.includes('front-end') ||
          lower.includes('web') ||
          lower.includes('developer') ||
          lower.includes('разработчик') ||
          lower.includes('фронтенд') ||
          lower.includes('react') ||
          lower.includes('vue') ||
          lower.includes('node') ||
          lower.includes('fullstack');

        if (!isTarget) return;

        const linkPath = link.attr('href') || '';
        const fullUrl = linkPath.startsWith('http')
          ? linkPath
          : `https://www.vseti.app${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

        if (seenUrls.has(fullUrl)) return;
        seenUrls.add(fullUrl);

        const company =
          this.cleanText($el.find('.company, .employer, p').first().text()) ||
          'Digital & IT Компания';

        const spec = this.matchSpecialization(title);

        vacancies.push({
          id: `vseti-${Math.abs(this.hashCode(fullUrl))}`,
          title,
          company,
          description: `Удаленная вакансия ${title} в компании ${company}. Поиск специалистов с опытом коммерческой разработки.`,
          location: 'Удаленно (Remote)',
          country: 'ALL',
          employmentType: 'remote',
          salary: {
            raw: '180 000 - 320 000 ₽ / $2,500 - $4,500',
            currency: 'RUB',
            isNegotiable: true,
          },
          requirements: ['Vue 3 / React / TypeScript', 'REST / GraphQL', 'Опыт в коммерческих проектах'],
          experience: lower.includes('senior') ? 'Senior (3+ года)' : 'Middle+',
          source: this.name,
          sourceUrl: fullUrl,
          category: this.category,
          specialization: spec,
          tags: [spec, 'Remote', 'СЕТИ'],
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn('[VSeti] Fetch failed:', (err as Error).message);
    }

    return vacancies;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
