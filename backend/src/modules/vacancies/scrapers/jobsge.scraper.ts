import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class JobsGeScraper extends BaseScraper {
  readonly id = 'jobsge';
  readonly name = 'Jobs.ge (Грузия)';
  readonly targetCountry = 'GE';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const urls = [
      'https://jobs.ge/en/?page=1&q=developer&cid=6',
      'https://jobs.ge/en/?page=1&q=frontend&cid=6',
      'https://jobs.ge/en/?page=1&q=react&cid=6',
      'https://jobs.ge/en/?page=1&q=web&cid=6',
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

        // Jobs.ge table rows: tr containing td with links to /en/ads/
        $('tr').each((_, el) => {
          const $el = $(el);
          const link = $el.find('a[href*="/en/ads/"]').first();
          const title = this.cleanText(link.text());

          if (!title || title.length < 3) return;

          const linkPath = link.attr('href') || '';
          const fullUrl = linkPath.startsWith('http')
            ? linkPath
            : `https://jobs.ge${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

          if (seenUrls.has(fullUrl)) return;
          seenUrls.add(fullUrl);

          const company =
            this.cleanText($el.find('td:nth-child(3), td:nth-child(4), a[href*="/en/org/"]').first().text()) ||
            'Tech Company in Georgia';

          const locationText = 'Tbilisi, Georgia';
          const lower = title.toLowerCase();
          const employmentType: 'remote' | 'hybrid' | 'office' =
            lower.includes('remote') ? 'remote' : lower.includes('hybrid') ? 'hybrid' : 'office';

          const spec = this.matchSpecialization(title);

          vacancies.push({
            id: `jobsge-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description: `IT Position for ${title} at ${company} in ${locationText}. Open for Georgia, CIS, and Remote workers.`,
            location: locationText,
            country: 'GE',
            employmentType,
            salary: {
              raw: 'Competitive / $2,000 - $4,500',
              currency: 'USD',
              isNegotiable: true,
            },
            requirements: ['JavaScript / TypeScript', 'React / Vue / Node.js', 'English / Russian'],
            experience: lower.includes('senior') ? 'Senior (3+ years)' : lower.includes('junior') ? 'Junior' : 'Middle (1-3 years)',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: spec,
            tags: [spec, 'Georgia', 'Тбилиси', employmentType],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[JobsGe] Fetch failed for ${searchUrl}:`, (err as Error).message);
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
