import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class HrGeScraper extends BaseScraper {
  readonly id = 'hrge';
  readonly name = 'HR.ge (Грузия)';
  readonly targetCountry = 'GE';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const urls = [
      'https://www.hr.ge/search-posting?category=4', // IT / Software
      'https://www.hr.ge/search-posting?keyword=developer',
      'https://www.hr.ge/search-posting?keyword=frontend',
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

        // HR.ge listing cards or links
        $('a[href*="/announcement/"], .announcement-item, .vacancy-row').each((_, el) => {
          const $el = $(el);
          const link = $el.is('a') ? $el : $el.find('a[href*="/announcement/"]').first();
          const title = this.cleanText(link.text()) || this.cleanText($el.find('.title, h2, h3').first().text());

          if (!title || title.length < 3) return;

          const linkPath = link.attr('href') || '';
          const fullUrl = linkPath.startsWith('http')
            ? linkPath
            : `https://www.hr.ge${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

          if (seenUrls.has(fullUrl)) return;
          seenUrls.add(fullUrl);

          const company =
            this.cleanText($el.find('.company-name, .client-name').first().text()) ||
            'Georgia IT Employer';

          const locationText = 'Tbilisi / Batumi, Georgia';
          const lower = title.toLowerCase();
          const spec = this.matchSpecialization(title);
          const description = `Вакансия ${title} в компании ${company} (Грузия). Доступно для специалистов в Тбилиси, Батуми и удаленно.`;

          vacancies.push({
            id: `hrge-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description,
            location: locationText,
            country: 'GE',
            employmentType: lower.includes('remote') ? 'remote' : 'hybrid',
            salary: {
              raw: 'По договоренности / Competitive',
              currency: 'GEL',
              isNegotiable: true,
            },
            requirements: this.extractRequirements(title, description),
            experience: lower.includes('senior') ? 'Senior (3+ years)' : lower.includes('junior') ? 'Junior' : 'Middle',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: spec,
            tags: [spec, 'Грузия', 'HR.ge'],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[HrGe] Fetch failed for ${searchUrl}:`, (err as Error).message);
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
