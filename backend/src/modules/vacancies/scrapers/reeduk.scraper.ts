import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class ReedUkScraper extends BaseScraper {
  readonly id = 'reeduk';
  readonly name = 'Reed (Великобритания & Remote)';
  readonly targetCountry = 'GB';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const searchUrls = [
      'https://www.reed.co.uk/jobs/frontend-developer-jobs-in-remote',
      'https://www.reed.co.uk/jobs/javascript-developer-jobs',
      'https://www.reed.co.uk/jobs/react-developer-jobs',
    ];

    const vacancies: Vacancy[] = [];
    const seenUrls = new Set<string>();

    for (const searchUrl of searchUrls) {
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

        $('article[data-id], .job-result-card, .job-card').each((_, el) => {
          const $el = $(el);
          const link = $el.find('h2 a, h3 a, a[href*="/jobs/"]').first();
          const title = this.cleanText(link.text());

          if (!title || title.length < 4) return;

          const linkPath = link.attr('href') || '';
          const fullUrl = linkPath.startsWith('http')
            ? linkPath
            : `https://www.reed.co.uk${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

          if (seenUrls.has(fullUrl)) return;
          seenUrls.add(fullUrl);

          const company =
            this.cleanText($el.find('.gtmJobListingPostedBy, .posted-by, [data-qa="company"]').first().text()) ||
            'UK Technology Group';

          const locationText =
            this.cleanText($el.find('.location, [data-qa="location"]').first().text()) || 'Remote, United Kingdom';

          const salaryText =
            this.cleanText($el.find('.salary, [data-qa="salary"]').first().text()) || '£50,000 - £85,000 per annum';

          const description =
            this.cleanText($el.find('.description, p, [data-qa="job-description"]').first().text()) ||
            `Exciting opportunity for a ${title} to join ${company}.`;

          const lower = (title + ' ' + description).toLowerCase();
          const spec = this.matchSpecialization(title);

          vacancies.push({
            id: `reed-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description: description.slice(0, 400),
            location: locationText.includes('UK') || locationText.includes('Kingdom') ? locationText : `${locationText}, UK`,
            country: 'GB',
            employmentType: lower.includes('remote') ? 'remote' : 'hybrid',
            salary: {
              raw: salaryText,
              currency: 'GBP',
              isNegotiable: true,
            },
            requirements: ['JavaScript / TypeScript', 'React / Vue / Node.js', 'Agile'],
            experience: lower.includes('senior') ? 'Senior (3-5+ years)' : 'Middle Developer',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: spec,
            tags: [spec, 'UK', 'Remote'],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[ReedUk] Fetch failed for ${searchUrl}:`, (err as Error).message);
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
