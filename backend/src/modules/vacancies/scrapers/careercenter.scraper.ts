import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class CareerCenterScraper extends BaseScraper {
  readonly id = 'careercenter';
  readonly name = 'Career Center (Армения)';
  readonly targetCountry = 'AM';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const searchUrl = 'https://careercenter.am/en';

    const vacancies: Vacancy[] = [];
    const seenUrls = new Set<string>();

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) return vacancies;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Careercenter.am table/listing rows
      $('tr, .job-item, .listing-row, a[href*="/job/"]').each((_, el) => {
        const $el = $(el);
        const linkElem = $el.is('a') ? $el : $el.find('a[href*="/job/"], a[href*="cc="]').first();
        const title = this.cleanText(linkElem.text()) || this.cleanText($el.find('h3, h4').first().text());

        if (!title || title.length < 4) return;

        const lower = title.toLowerCase();
        // Check if IT/software related
        const isItRelated =
          lower.includes('developer') ||
          lower.includes('engineer') ||
          lower.includes('frontend') ||
          lower.includes('front-end') ||
          lower.includes('web') ||
          lower.includes('react') ||
          lower.includes('javascript') ||
          lower.includes('node') ||
          lower.includes('fullstack');

        if (!isItRelated) return;

        const linkPath = linkElem.attr('href') || '';
        const fullUrl = linkPath.startsWith('http')
          ? linkPath
          : `https://careercenter.am/${linkPath.startsWith('/') ? linkPath.slice(1) : linkPath}`;

        if (seenUrls.has(fullUrl)) return;
        seenUrls.add(fullUrl);

        const company =
          this.cleanText($el.find('td:nth-child(2), .company, .org').first().text()) ||
          'IT Company in Armenia';

        const locationText = 'Yerevan, Armenia';
        const spec = this.matchSpecialization(title);

        vacancies.push({
          id: `careercenter-${Math.abs(this.hashCode(fullUrl))}`,
          title,
          company,
          description: `Career opportunity for ${title} at ${company}. Open for candidates in Armenia and Remote.`,
          location: locationText,
          country: 'AM',
          employmentType: lower.includes('remote') ? 'remote' : 'hybrid',
          salary: {
            raw: 'По договоренности / Competitive',
            currency: 'AMD',
            isNegotiable: true,
          },
          requirements: ['Web Technologies', 'Software Engineering', 'Analytical skills'],
          experience: lower.includes('senior') ? 'Senior (3+ years)' : '1-3 years',
          source: this.name,
          sourceUrl: fullUrl,
          category: this.category,
          specialization: spec,
          tags: [spec, 'Armenia', 'CareerCenter'],
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn('[CareerCenter] Fetch failed:', (err as Error).message);
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
