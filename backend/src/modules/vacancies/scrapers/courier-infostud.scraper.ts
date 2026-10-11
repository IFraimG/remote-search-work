import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';

export class CourierInfostudScraper extends BaseScraper {
  readonly id = 'courier_infostud';
  readonly name = 'Poslovi Infostud (Курьеры Сербия)';
  readonly targetCountry = 'serbia';
  readonly category = 'courier';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const serbianQueries = ['kurir', 'dostavljac'];

    for (const query of serbianQueries) {
      try {
        const url = `https://poslovi.infostud.com/oglasi-za-posao/${encodeURIComponent(query)}`;
        const { statusCode, body } = await request(url, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'sr-RS,sr;q=0.9,en;q=0.8',
          },
          headersTimeout: 10000,
          bodyTimeout: 10000,
        });

        if (statusCode !== 200) continue;

        const html = await body.text();
        const $ = cheerio.load(html);

        $('[data-job-id], .job-item, article.job, .item_wrapper, div.uk-card').each((_, element) => {
          const $el = $(element);
          const title = this.cleanText(
            $el.find('h2, h3, a.uk-text-bold, [class*="job-title"]').first().text()
          );
          if (!title || title.length < 3) return;

          const linkHref =
            $el.find('a[href*="/posao/"], h2 a, h3 a').first().attr('href') || '';
          if (!linkHref) return;

          const sourceUrl = linkHref.startsWith('http')
            ? linkHref
            : `https://poslovi.infostud.com${linkHref}`;

          const company =
            this.cleanText(
              $el.find('[class*="company"], .employer, [data-employer-name]').first().text()
            ) || 'Dostavna služba';

          const locationText = this.cleanText(
            $el.find('[class*="city"], [class*="location"]').first().text()
          ) || 'Srbija';

          const rawDesc = this.cleanText(
            $el.find('p, [class*="description"]').first().text()
          );

          const rawSalary = this.cleanText(
            $el.find('[class*="salary"], [class*="plata"]').first().text()
          );

          const id = `courier_rs_${Buffer.from(sourceUrl).toString('base64url').slice(-24)}`;

          if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
            vacancies.push({
              id,
              title: title.includes('Kurir') || title.includes('Dostavljač') ? title : `Kurir / Dostavljač: ${title}`,
              company,
              description: rawDesc || `Posao kurira / dostavljača u kompaniji ${company}. Grad: ${locationText}.`,
              location: locationText,
              country: 'serbia',
              city: locationText.includes('Beograd')
                ? 'Beograd'
                : locationText.includes('Novi Sad')
                ? 'Novi Sad'
                : locationText,
              employmentType: 'office',
              salary: {
                raw: rawSalary || 'Po dogovoru (od 70.000 do 130.000 RSD)',
                currency: 'RSD',
                isNegotiable: !rawSalary,
              },
              requirements: this.extractRequirements(title, rawDesc),
              experience: 'Bez iskustva / Sa iskustvom',
              source: 'Poslovi Infostud (Kurir)',
              sourceUrl,
              category: 'courier',
              specialization: 'Курьер / Доставка',
              tags: ['Сербия', 'Курьер', 'Доставка', 'Транспорт'],
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        console.warn(`Courier Serbia scrape error on query ${query}:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
