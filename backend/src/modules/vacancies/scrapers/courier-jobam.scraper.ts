import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class CourierJobAmScraper extends BaseScraper {
  readonly id = 'courier-jobam';
  readonly name = 'Job.am Курьеры (Армения)';
  readonly targetCountry = 'AM';
  readonly category = CATEGORIES.COURIER;

  protected async scrape(): Promise<Vacancy[]> {
    const urls = [
      'https://job.am/en/jobs?q=courier',
      'https://job.am/en/jobs?q=delivery',
      'https://job.am/en/jobs?q=driver',
    ];

    const vacancies: Vacancy[] = [];
    const seenUrls = new Set<string>();

    for (const searchUrl of urls) {
      try {
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = cheerio.load(html);

        $('.job-item, .vacancy-item, .job-card, .list-group-item, article').each((_, el) => {
          const $el = $(el);
          const title = this.cleanText(
            $el.find('h2, h3, h4, .job-title, .title, a[href*="/jobs/"]').first().text()
          );
          if (!title || title.length < 3) return;

          const linkPath = $el.find('a[href*="/jobs/"]').attr('href') || $el.find('a').attr('href') || '';
          const fullUrl = linkPath.startsWith('http')
            ? linkPath
            : `https://job.am${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

          if (seenUrls.has(fullUrl)) return;
          seenUrls.add(fullUrl);

          const company =
            this.cleanText($el.find('.company, .company-name, .employer').first().text()) ||
            'Служба доставки Ереван';

          const locationText = 'Ереван, Армения';

          vacancies.push({
            id: `courier-jobam-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description: `Доставка заказов и документов по Еревану в компании ${company}. Быстрый расчет, гибкий график.`,
            location: locationText,
            country: 'AM',
            employmentType: 'office',
            salary: {
              raw: '180 000 - 350 000 AMD',
              currency: 'AMD',
              min: 180000,
              max: 350000,
            },
            requirements: this.extractRequirements(title, `Доставка заказов и документов по Еревану в компании ${company}.`),
            experience: 'Без опыта',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: 'Курьер / Доставка',
            tags: ['Курьер', 'Доставка', 'Армения'],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[CourierJobAm] Fetch failed for ${searchUrl}:`, (err as Error).message);
      }
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
