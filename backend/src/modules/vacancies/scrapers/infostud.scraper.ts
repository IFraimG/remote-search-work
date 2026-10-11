import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

export class InfostudScraper extends BaseScraper {
  readonly id = 'infostud_serbia';
  readonly name = 'Poslovi Infostud (Serbia)';
  readonly targetCountry = 'serbia';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const searchKeywords = ['frontend', 'react', 'vue', 'fullstack', 'javascript'];

    // Scrape Serbian IT positions from Poslovi Infostud directly
    for (const keyword of searchKeywords) {
      try {
        const url = `https://poslovi.infostud.com/oglasi-za-posao/${encodeURIComponent(keyword)}?es_category_root_id=5`;
        const { statusCode, body } = await request(url, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'sr-RS,sr;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          headersTimeout: 8000,
          bodyTimeout: 8000,
        });

        if (statusCode !== 200) {
          continue;
        }

        const html = await body.text();
        const $ = cheerio.load(html);

        // Parse search items on poslovi.infostud.com
        $('[data-job-id], .job-item, article.job, .item_wrapper, div.uk-card').each((_, element) => {
          const $el = $(element);
          const title = this.cleanText(
            $el.find('h2, h3, a.uk-text-bold, [class*="job-title"], a[data-job-title]').first().text()
          );
          if (!title || title.length < 3) return;

          const linkHref =
            $el.find('a[href*="/posao/"], a[data-job-url], h2 a, h3 a').first().attr('href') || '';
          if (!linkHref) return;

          const sourceUrl = linkHref.startsWith('http')
            ? linkHref
            : `https://poslovi.infostud.com${linkHref}`;

          const company =
            this.cleanText(
              $el.find('[class*="company"], .employer, [data-employer-name], p.uk-text-muted').first().text()
            ) || 'Poslodavac';

          const locationText = this.cleanText(
            $el.find('[class*="city"], [class*="location"], span.uk-text-truncate').first().text()
          );

          const rawDesc = this.cleanText(
            $el.find('p, [class*="description"], [class*="lead"]').first().text()
          );

          const rawSalary = this.cleanText(
            $el.find('[class*="salary"], [class*="plata"], span.uk-badge-success').first().text()
          );

          let empType: EmploymentType = 'office';
          const fullText = (title + ' ' + locationText + ' ' + rawDesc).toLowerCase();
          if (fullText.includes('remote') || fullText.includes('rad od kuće') || fullText.includes('udaljeno')) {
            empType = 'remote';
          } else if (fullText.includes('hibrid') || fullText.includes('hybrid')) {
            empType = 'hybrid';
          }

          const spec = this.matchSpecialization(title + ' ' + rawDesc);

          const id = `infostud_${Buffer.from(sourceUrl).toString('base64url').slice(-24)}`;

          if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
            vacancies.push({
              id,
              title,
              company,
              description: rawDesc || `Oglas za poziciju ${title} u kompaniji ${company}. Detalji na poslovi.infostud.com`,
              location: locationText || 'Srbija',
              country: 'serbia',
              city: locationText.includes('Beograd')
                ? 'Beograd'
                : locationText.includes('Novi Sad')
                ? 'Novi Sad'
                : locationText || 'Srbija',
              employmentType: empType,
              salary: {
                raw: rawSalary || 'Po dogovoru',
                currency: rawSalary.includes('EUR') || rawSalary.includes('€') ? 'EUR' : 'RSD',
                isNegotiable: !rawSalary,
              },
              requirements: [
                'Iskustvo u relevantnim web tehnologijama',
                'Poznavanje modernih JS/TS radnih okvira',
              ],
              experience: fullText.includes('senior')
                ? 'Senior (3+ god)'
                : fullText.includes('junior')
                ? 'Junior (1+ god)'
                : 'Medior (2+ god)',
              source: 'Poslovi Infostud',
              sourceUrl,
              category: 'it',
              specialization: spec,
              tags: ['Serbia', 'IT', spec, empType],
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        // Log individual keyword failure but continue trying other keywords
        console.warn(`Infostud scrape keyword "${keyword}" issue:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
