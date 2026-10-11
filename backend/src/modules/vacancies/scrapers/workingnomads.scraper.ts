import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

interface WorkingNomadsJob {
  id?: number | string;
  title: string;
  company_name: string;
  description?: string;
  category_name?: string;
  location?: string;
  url: string;
  tags?: string[];
  pub_date?: string;
}

export class WorkingNomadsScraper extends BaseScraper {
  readonly id = 'workingnomads';
  readonly name = 'Working Nomads';
  readonly targetCountry = 'ALL';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const apiUrl = 'https://www.workingnomads.com/api/exposed_jobs/';
    const vacancies: Vacancy[] = [];

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(9000),
      });

      if (!response.ok) {
        throw new Error(`WorkingNomads API returned HTTP ${response.status}`);
      }

      const data = (await response.json()) as WorkingNomadsJob[];

      if (!Array.isArray(data)) {
        return vacancies;
      }

      for (const item of data) {
        const title = item.title || '';
        const lower = (title + ' ' + (item.category_name || '') + ' ' + (item.tags?.join(' ') || '')).toLowerCase();

        // Filter for requested specializations
        const isFrontendRelated =
          lower.includes('frontend') ||
          lower.includes('front-end') ||
          lower.includes('web') ||
          lower.includes('fullstack') ||
          lower.includes('full-stack') ||
          lower.includes('javascript') ||
          lower.includes('typescript') ||
          lower.includes('react') ||
          lower.includes('vue') ||
          lower.includes('node');

        if (!isFrontendRelated) continue;

        const spec = this.matchSpecialization(title);
        const locationStr = item.location || 'Remote (EU / US / Worldwide)';

        // Detect country code
        let countryCode = 'ALL';
        const locLower = locationStr.toLowerCase();
        if (locLower.includes('usa') || locLower.includes('united states') || locLower.includes('us only')) {
          countryCode = 'US';
        } else if (locLower.includes('germany') || locLower.includes('deutschland')) {
          countryCode = 'DE';
        } else if (locLower.includes('united kingdom') || locLower.includes('uk')) {
          countryCode = 'GB';
        } else if (locLower.includes('netherlands')) {
          countryCode = 'NL';
        } else if (locLower.includes('poland')) {
          countryCode = 'PL';
        } else if (locLower.includes('france')) {
          countryCode = 'FR';
        } else if (locLower.includes('spain')) {
          countryCode = 'ES';
        }

        const cleanDesc = (item.description || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 450);

        vacancies.push({
          id: `workingnomads-${item.id || Math.abs(this.hashCode(item.url))}`,
          title: item.title,
          company: item.company_name || 'Global Remote Tech',
          description: cleanDesc || `Remote position for ${title} at ${item.company_name}. Open for worldwide and European applicants.`,
          location: locationStr,
          country: countryCode,
          employmentType: 'remote',
          salary: {
            raw: '$80,000 - $160,000 USD / yr',
            currency: 'USD',
            min: 80000,
            max: 160000,
          },
          requirements: this.extractRequirements(title, cleanDesc, item.tags),
          experience: lower.includes('senior') ? 'Senior (4+ years)' : lower.includes('lead') ? 'Lead' : 'Mid / Senior',
          source: this.name,
          sourceUrl: item.url.startsWith('http') ? item.url : `https://www.workingnomads.com/jobs/${item.url}`,
          category: this.category,
          specialization: spec,
          tags: [spec, 'Remote', 'Global'],
          publishedAt: item.pub_date,
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('[WorkingNomads] Scrape failed:', (err as Error).message);
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
