import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

export class WeWorkRemotelyScraper extends BaseScraper {
  readonly id = 'weworkremotely_global';
  readonly name = 'WeWorkRemotely (EU & US Remote)';
  readonly targetCountry = 'global_remote';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const urls = [
      'https://weworkremotely.com/categories/remote-front-end-programming-jobs',
      'https://weworkremotely.com/categories/remote-full-stack-programming-jobs',
    ];

    for (const url of urls) {
      try {
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

        if (statusCode !== 200) continue;

        const html = await body.text();
        const $ = cheerio.load(html);

        $('section.jobs article ul li:not(.view-all)').each((_, el) => {
          const $el = $(el);
          const link = $el.find('a[href*="/remote-jobs/"]').last();
          const linkHref = link.attr('href');
          if (!linkHref) return;

          const sourceUrl = linkHref.startsWith('http')
            ? linkHref
            : `https://weworkremotely.com${linkHref}`;

          const title = this.cleanText($el.find('.title').first().text());
          if (!title) return;

          const company = this.cleanText($el.find('.company').first().text()) || 'Remote Company';
          const region = this.cleanText($el.find('.region').first().text()) || 'Anywhere in the World';

          const locLower = (region + ' ' + title).toLowerCase();
          let country = 'global_remote';
          if (locLower.includes('usa') || locLower.includes('us only') || locLower.includes('americas')) {
            country = 'usa';
          } else if (locLower.includes('germany')) {
            country = 'germany';
          } else if (locLower.includes('uk') || locLower.includes('london')) {
            country = 'uk';
          } else if (locLower.includes('netherlands')) {
            country = 'netherlands';
          } else if (locLower.includes('poland')) {
            country = 'poland';
          } else if (locLower.includes('france')) {
            country = 'france';
          } else if (locLower.includes('spain')) {
            country = 'spain';
          } else if (locLower.includes('europe') || locLower.includes('eu only')) {
            country = 'poland';
          }

          const spec = this.matchSpecialization(title);
          const id = `wwr_${Buffer.from(sourceUrl).toString('base64url').slice(-24)}`;

          if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
            vacancies.push({
              id,
              title,
              company,
              description: `Remote job for ${title} at ${company}. Open for candidates in ${region}. Listed on We Work Remotely.`,
              location: region,
              country,
              employmentType: 'remote' as EmploymentType,
              salary: {
                raw: 'Competitive compensation',
                currency: country === 'usa' ? 'USD' : 'EUR',
                isNegotiable: true,
              },
              requirements: [
                'Experience building high-performance web applications',
                'Strong communication skills in distributed teams',
              ],
              experience: title.toLowerCase().includes('senior')
                ? 'Senior (4+ years)'
                : title.toLowerCase().includes('lead')
                ? 'Lead Developer'
                : 'Mid-Senior (3+ years)',
              source: 'WeWorkRemotely',
              sourceUrl,
              category: 'it',
              specialization: spec,
              tags: ['Remote', 'WeWorkRemotely', spec],
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch (err) {
        console.warn(`WeWorkRemotely scrape error on ${url}:`, err instanceof Error ? err.message : err);
      }
    }

    return vacancies;
  }
}
