import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class ItJobsPtScraper extends BaseScraper {
  readonly id = 'itjobspt';
  readonly name = 'ITJobs (Португалия & Европа)';
  readonly targetCountry = 'ALL';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const rssUrl = 'https://www.itjobs.pt/rss/emprego';
    const vacancies: Vacancy[] = [];

    try {
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        signal: AbortSignal.timeout(9000),
      });

      if (!response.ok) {
        throw new Error(`ITJobs RSS returned HTTP ${response.status}`);
      }

      const xml = await response.text();
      const $ = cheerio.load(xml, { xmlMode: true });

      $('item').each((_, el) => {
        const title = this.cleanText($(el).find('title').text());
        const link = this.cleanText($(el).find('link').text());
        const description = this.cleanText($(el).find('description').text());
        const pubDate = this.cleanText($(el).find('pubDate').text());

        if (!title || !link) return;

        const lower = (title + ' ' + description).toLowerCase();

        const isDev =
          lower.includes('developer') ||
          lower.includes('frontend') ||
          lower.includes('front-end') ||
          lower.includes('web') ||
          lower.includes('javascript') ||
          lower.includes('react') ||
          lower.includes('vue') ||
          lower.includes('node') ||
          lower.includes('fullstack') ||
          lower.includes('full stack');

        if (!isDev) return;

        const spec = this.matchSpecialization(title);
        const employmentType: 'remote' | 'hybrid' | 'office' =
          lower.includes('remote') || lower.includes('remoto')
            ? 'remote'
            : lower.includes('hibrido') || lower.includes('hybrid')
              ? 'hybrid'
              : 'office';

        vacancies.push({
          id: `itjobspt-${Math.abs(this.hashCode(link))}`,
          title,
          company: 'European Tech Partner',
          description: description.replace(/<[^>]*>/g, '').slice(0, 400),
          location: employmentType === 'remote' ? 'Remote (Portugal / EU)' : 'Lisbon / Porto, Portugal',
          country: 'ALL',
          employmentType,
          salary: {
            raw: '€35,000 - €70,000 EUR / yr',
            currency: 'EUR',
            min: 35000,
            max: 70000,
          },
          requirements: ['JavaScript / TypeScript', 'React / Vue / Node.js', 'English / European remote'],
          experience: lower.includes('senior') ? 'Senior (3+ years)' : 'Middle',
          source: this.name,
          sourceUrl: link,
          category: this.category,
          specialization: spec,
          tags: [spec, 'Europe', 'ITJobs'],
          publishedAt: pubDate,
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn('[ItJobsPt] Scrape failed:', (err as Error).message);
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
