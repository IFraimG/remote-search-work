import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class CourierLakoDoPoslaScraper extends BaseScraper {
  readonly id = 'courier-lakodoposla';
  readonly name = 'Lako do posla Курьеры (Сербия)';
  readonly targetCountry = 'RS';
  readonly category = CATEGORIES.COURIER;

  protected async scrape(): Promise<Vacancy[]> {
    const urls = [
      'https://www.lakodoposla.com/pretraga-poslova?keywords=dostavljac',
      'https://www.lakodoposla.com/pretraga-poslova?keywords=kurir',
      'https://www.lakodoposla.com/pretraga-poslova?keywords=dostava',
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
            'Accept-Language': 'sr-RS,sr;q=0.9,en;q=0.8',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = cheerio.load(html);

        const jobElements = $('.job-item, .job-listing, .oglas-item, article.job, .search-result-item');

        jobElements.each((_, el) => {
          const $el = $(el);
          const title = this.cleanText(
            $el.find('.job-title, h2, h3, a.title, .naziv-oglasa').first().text()
          );
          if (!title) return;

          const linkPath = $el.find('a').attr('href') || '';
          const fullUrl = linkPath.startsWith('http')
            ? linkPath
            : `https://www.lakodoposla.com${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

          if (seenUrls.has(fullUrl)) return;
          seenUrls.add(fullUrl);

          const company =
            this.cleanText($el.find('.company-name, .poslodavac, .company').first().text()) ||
            'Служба доставки (Сербия)';

          const locationText =
            this.cleanText($el.find('.location, .grad, .mesto').first().text()) || 'Белград, Сербия';

          const snippet =
            this.cleanText($el.find('.description, .opis, p').first().text()) ||
            `Доставка заказов и корреспонденции по городу ${locationText}.`;

          vacancies.push({
            id: `courier-lakodoposla-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description: snippet.slice(0, 400),
            location: locationText.includes('Сербия') || locationText.includes('Srbija') ? locationText : `${locationText}, Сербия`,
            country: 'RS',
            employmentType: 'office',
            salary: {
              raw: '80 000 - 150 000 RSD',
              currency: 'RSD',
              min: 80000,
              max: 150000,
            },
            requirements: ['Водительские права / велосипед / скутер', 'Знание города', 'Ответственность'],
            experience: 'Без опыта / приветствуется опыт вождения',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: 'Курьер / Доставка',
            tags: ['Курьер', 'Доставка', 'Сербия'],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[CourierLakoDoPosla] Fetch failed for ${searchUrl}:`, (err as Error).message);
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
