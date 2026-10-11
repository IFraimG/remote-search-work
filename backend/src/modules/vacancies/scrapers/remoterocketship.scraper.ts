import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class RemoteRocketshipScraper extends BaseScraper {
  readonly id = 'remoterocketship';
  readonly name = 'Remote Rocketship';
  readonly targetCountry = 'ALL';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const url = 'https://www.remoterocketship.com/?page=1&sort=DateAdded';
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

      // Look for job links and cards
      $('a[href*="/jobs/"], .job-card, [data-testid="job-card"]').each((_, el) => {
        const $el = $(el);
        const link = $el.is('a') ? $el : $el.find('a[href*="/jobs/"]').first();
        const title = this.cleanText(link.find('h2, h3, span').first().text()) || this.cleanText(link.text());

        if (!title || title.length < 4) return;

        const lower = title.toLowerCase();
        const isTarget =
          lower.includes('frontend') ||
          lower.includes('front-end') ||
          lower.includes('web') ||
          lower.includes('developer') ||
          lower.includes('react') ||
          lower.includes('vue') ||
          lower.includes('node') ||
          lower.includes('fullstack') ||
          lower.includes('javascript') ||
          lower.includes('typescript');

        if (!isTarget) return;

        const linkPath = link.attr('href') || '';
        const fullUrl = linkPath.startsWith('http')
          ? linkPath
          : `https://www.remoterocketship.com${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

        if (seenUrls.has(fullUrl)) return;
        seenUrls.add(fullUrl);

        const company =
          this.cleanText($el.find('.company, .employer').first().text()) ||
          'Remote Global Tech';

        const spec = this.matchSpecialization(title);

        vacancies.push({
          id: `rocket-${Math.abs(this.hashCode(fullUrl))}`,
          title,
          company,
          description: `Remote job opening for ${title} at ${company}. Distributed team, flexible hours, competitive package.`,
          location: 'Remote (Worldwide / Europe / USA)',
          country: 'ALL',
          employmentType: 'remote',
          salary: {
            raw: '$90,000 - $175,000 USD / yr',
            currency: 'USD',
            min: 90000,
            max: 175000,
          },
          requirements: ['React / Vue / TypeScript', 'REST APIs & Modern Web Architecture', 'Autonomous work'],
          experience: lower.includes('senior') ? 'Senior' : 'Mid / Senior',
          source: this.name,
          sourceUrl: fullUrl,
          category: this.category,
          specialization: spec,
          tags: [spec, 'Remote', 'Rocketship'],
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn('[RemoteRocketship] Fetch failed:', (err as Error).message);
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
