import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

export class HabrCareerScraper extends BaseScraper {
  readonly id = 'habrcareer_cis';
  readonly name = 'Хабр Карьера (Грузия, Армения, Узбекистан Remote)';
  readonly targetCountry = 'cis_remote';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    // Allowed CIS countries per prompt specification: strictly Georgia, Armenia, Uzbekistan
    const regions = [
      { name: 'Грузия', code: 'georgia', q: 'georgia', locId: 'c_682' },
      { name: 'Армения', code: 'armenia', q: 'armenia', locId: 'c_674' },
      { name: 'Узбекистан', code: 'uzbekistan', q: 'uzbekistan', locId: 'c_691' },
    ];

    for (const region of regions) {
      try {
        const url = `https://career.habr.com/vacancies?remote=true&locations[]=${region.locId}&q=frontend`;
        const { statusCode, body } = await request(url, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8',
          },
          headersTimeout: 8000,
          bodyTimeout: 8000,
        });

        if (statusCode !== 200) continue;

        const html = await body.text();
        const $ = cheerio.load(html);

        $('.vacancy-card, .section-box .vacancy-card__inner, div[class*="vacancy-card"]').each((_, el) => {
          const $el = $(el);
          const title = this.cleanText(
            $el.find('.vacancy-card__title a, a[class*="vacancy-card__title"]').first().text()
          );
          if (!title || title.length < 3) return;

          const linkHref =
            $el.find('.vacancy-card__title a, a[class*="vacancy-card__title"]').first().attr('href') || '';
          if (!linkHref) return;

          const sourceUrl = linkHref.startsWith('http')
            ? linkHref
            : `https://career.habr.com${linkHref}`;

          const company =
            this.cleanText(
              $el.find('.vacancy-card__company-title a, [class*="company-title"]').first().text()
            ) || 'IT Компания';

          const salaryText = this.cleanText(
            $el.find('.vacancy-card__salary, [class*="salary"]').first().text()
          );

          const metaText = this.cleanText(
            $el.find('.vacancy-card__meta, [class*="meta"]').first().text()
          );

          const spec = this.matchSpecialization(title);
          const id = `habr_${Buffer.from(sourceUrl).toString('base64url').slice(-24)}`;

          if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
            vacancies.push({
              id,
              title,
              company,
              description: `Удаленная вакансия ${title} в ${company} (${region.name}). Источник: Хабр Карьера.`,
              location: `${region.name} (Удаленно)`,
              country: region.code,
              employmentType: 'remote' as EmploymentType,
              salary: {
                raw: salaryText || 'Договорная',
                currency: salaryText.includes('$')
                  ? 'USD'
                  : salaryText.includes('€')
                  ? 'EUR'
                  : salaryText.includes('₽')
                  ? 'RUB'
                  : 'USD',
                isNegotiable: !salaryText,
              },
              requirements: [
                'Уверенное владение современным стеком веб-разработки',
                'Опыт коммерческой разработки и работы в распределенной команде',
              ],
              experience: metaText.includes('Senior')
                ? 'Senior (4+ года)'
                : metaText.includes('Junior')
                ? 'Junior (1+ год)'
                : 'Middle (2+ года)',
              source: 'Хабр Карьера',
              sourceUrl,
              category: 'it',
              specialization: spec,
              tags: [region.name, 'Remote', 'СНГ', spec],
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        console.warn(`HabrCareer scraper error for ${region.name}:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
