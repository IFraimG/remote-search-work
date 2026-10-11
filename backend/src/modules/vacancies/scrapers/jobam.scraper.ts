import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class JobAmScraper extends BaseScraper {
  readonly id = 'jobam';
  readonly name = 'Job.am (Армения)';
  readonly targetCountry = 'AM';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const urls = [
      'https://job.am/en/jobs?q=frontend',
      'https://job.am/en/jobs?q=developer',
      'https://job.am/en/jobs?q=react',
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

        // Job.am listing elements
        const jobItems = $('.job-item, .vacancy-item, .job-card, .list-group-item, article');

        jobItems.each((_, el) => {
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
            'Tech Company Armenia';

          const locationText =
            this.cleanText($el.find('.location, .city').first().text()) || 'Yerevan, Armenia';

          const snippet =
            this.cleanText($el.find('.description, p, .snippet').first().text()) ||
            `Job opportunity for ${title} at ${company} in ${locationText}.`;

          const lower = (title + ' ' + snippet).toLowerCase();
          const employmentType: 'remote' | 'hybrid' | 'office' =
            lower.includes('remote') ? 'remote' : lower.includes('hybrid') ? 'hybrid' : 'office';

          const spec = this.matchSpecialization(title + ' ' + snippet);

          vacancies.push({
            id: `jobam-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description: snippet.slice(0, 400),
            location: locationText.includes('Armenia') ? locationText : `${locationText}, Armenia`,
            country: 'AM',
            employmentType,
            salary: {
              raw: 'Competitive / По договоренности',
              currency: 'AMD',
              isNegotiable: true,
            },
            requirements: ['JavaScript / TypeScript', 'React / Vue / Node.js', 'English'],
            experience: lower.includes('senior') ? 'Senior (3+ years)' : lower.includes('junior') ? 'Junior' : 'Middle (1-3 years)',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: spec,
            tags: [spec, 'Armenia', employmentType],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[JobAm] Fetch failed for ${searchUrl}:`, (err as Error).message);
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
