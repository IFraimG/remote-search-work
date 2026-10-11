import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

export class RemotiveScraper extends BaseScraper {
  readonly id = 'remotive_global';
  readonly name = 'Remotive (Europe / USA Remote)';
  readonly targetCountry = 'global_remote';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const url = 'https://remotive.com/remote-jobs/software-dev';

    const { statusCode, body } = await request(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      headersTimeout: 10000,
      bodyTimeout: 10000,
    });

    if (statusCode !== 200) {
      throw new Error(`Failed to fetch Remotive: HTTP status ${statusCode}`);
    }

    const html = await body.text();
    const $ = cheerio.load(html);

    $('li.job-list-item, div.job-tile, .job-row, div[data-job-id]').each((_, element) => {
      const $el = $(element);
      const title = this.cleanText(
        $el.find('.position, .job-title, h3, a[href*="/remote-jobs/"]').first().text()
      );
      if (!title || title.length < 3) return;

      const linkHref =
        $el.find('a[href*="/remote-jobs/"]').first().attr('href') || '';
      if (!linkHref) return;

      const sourceUrl = linkHref.startsWith('http')
        ? linkHref
        : `https://remotive.com${linkHref}`;

      const company =
        this.cleanText(
          $el.find('.company-name, .company, span.tw-font-medium').first().text()
        ) || 'Tech Company';

      const locationText = this.cleanText(
        $el.find('.location, span.location-text, [class*="candidate-location"]').first().text()
      ) || 'Worldwide (Remote)';

      const rawSalary = this.cleanText(
        $el.find('.salary, [class*="salary"]').first().text()
      );

      const rawDesc = this.cleanText(
        $el.find('p, [class*="description"], .job-tags').first().text()
      );

      // Map country based on location criteria
      const locLower = (locationText + ' ' + title).toLowerCase();
      let country = 'global_remote';
      if (locLower.includes('usa') || locLower.includes('united states') || locLower.includes('us only')) {
        country = 'usa';
      } else if (locLower.includes('germany') || locLower.includes('deutschland')) {
        country = 'germany';
      } else if (locLower.includes('uk') || locLower.includes('united kingdom') || locLower.includes('london')) {
        country = 'uk';
      } else if (locLower.includes('netherlands') || locLower.includes('amsterdam')) {
        country = 'netherlands';
      } else if (locLower.includes('poland') || locLower.includes('polska')) {
        country = 'poland';
      } else if (locLower.includes('france') || locLower.includes('paris')) {
        country = 'france';
      } else if (locLower.includes('spain') || locLower.includes('madrid') || locLower.includes('barcelona')) {
        country = 'spain';
      } else if (locLower.includes('europe') || locLower.includes('eu only') || locLower.includes('emea')) {
        country = 'germany'; // default EU representative or global
      }

      const spec = this.matchSpecialization(title + ' ' + rawDesc);
      const id = `remotive_${Buffer.from(sourceUrl).toString('base64url').slice(-24)}`;

      vacancies.push({
        id,
        title,
        company,
        description: rawDesc || `Remote position for ${title} at ${company}. Open for candidates in: ${locationText}`,
        location: locationText,
        country,
        city: undefined,
        employmentType: 'remote' as EmploymentType,
        salary: {
          raw: rawSalary || 'Competitive / Market Rate',
          currency: rawSalary.includes('€') ? 'EUR' : rawSalary.includes('$') ? 'USD' : 'USD',
          isNegotiable: !rawSalary,
        },
        requirements: [
          'Proficiency in modern TypeScript/JavaScript frameworks',
          'Autonomous remote team collaboration experience',
        ],
        experience: title.toLowerCase().includes('senior')
          ? 'Senior (4+ years)'
          : title.toLowerCase().includes('lead')
          ? 'Lead / Architect'
          : 'Middle (2+ years)',
        source: 'Remotive',
        sourceUrl,
        category: 'it',
        specialization: spec,
        tags: ['Remote', 'Software Dev', spec, country.toUpperCase()],
        scrapedAt: new Date().toISOString(),
      });
    });

    return vacancies;
  }
}
