import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class JobsinNetworkScraper extends BaseScraper {
  readonly id = 'jobsinnetwork';
  readonly name = 'JobsinNetwork (Европа & США)';
  readonly targetCountry = 'ALL';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const urls = [
      'https://jobsinnetwork.com/jobs/frontend',
      'https://jobsinnetwork.com/jobs/developer',
    ];

    const vacancies: Vacancy[] = [];
    const seenUrls = new Set<string>();

    for (const searchUrl of urls) {
      try {
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = cheerio.load(html);

        $('.job, .job-item, .job-listing, article').each((_, el) => {
          const $el = $(el);
          const link = $el.find('h2 a, h3 a, a[href*="/job/"]').first();
          const title = this.cleanText(link.text());

          if (!title || title.length < 4) return;

          const linkPath = link.attr('href') || '';
          const fullUrl = linkPath.startsWith('http')
            ? linkPath
            : `https://jobsinnetwork.com${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

          if (seenUrls.has(fullUrl)) return;
          seenUrls.add(fullUrl);

          const company =
            this.cleanText($el.find('.company, .employer, .company-name').first().text()) ||
            'International Tech Enterprise';

          const locationText =
            this.cleanText($el.find('.location, .city').first().text()) || 'Remote (Europe / USA)';

          const description =
            this.cleanText($el.find('.description, p, .summary').first().text()) ||
            `English-speaking international position for ${title} at ${company}.`;

          const lower = (title + ' ' + description).toLowerCase();
          const spec = this.matchSpecialization(title);

          vacancies.push({
            id: `jin-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description: description.slice(0, 400),
            location: locationText,
            country: 'ALL',
            employmentType: lower.includes('remote') ? 'remote' : 'hybrid',
            salary: {
              raw: 'Competitive International Salary',
              currency: 'EUR',
              isNegotiable: true,
            },
            requirements: this.extractRequirements(title, description),
            experience: '2-4+ years',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: spec,
            tags: [spec, 'International', 'English'],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[JobsinNetwork] Fetch failed for ${searchUrl}:`, (err as Error).message);
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
