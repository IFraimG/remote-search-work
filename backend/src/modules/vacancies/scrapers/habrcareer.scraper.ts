import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

export class HabrCareerScraper extends BaseScraper {
  readonly id = 'habrcareer_cis';
  readonly name = 'Хабр Карьера (СНГ & Remote)';
  readonly targetCountry = 'cis_remote';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const searchQueries = [
      { q: 'frontend', country: 'georgia', label: 'Грузия' },
      { q: 'react', country: 'armenia', label: 'Армения' },
      { q: 'vue', country: 'uzbekistan', label: 'Узбекистан' },
      { q: 'fullstack', country: 'georgia', label: 'Грузия' },
    ];

    for (const item of searchQueries) {
      try {
        const url = `https://career.habr.com/vacancies?remote=true&q=${encodeURIComponent(item.q)}`;
        const { statusCode, body } = await request(url, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8',
          },
          headersTimeout: 10000,
          bodyTimeout: 10000,
        });

        if (statusCode !== 200) continue;

        const html = await body.text();
        const $ = cheerio.load(html);

        $('.vacancy-card, [class*="vacancy-card"]').each((_, el) => {
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

          // Randomize / cycle between allowed CIS target countries (Georgia, Armenia, Uzbekistan)
          const targetCis = item.country;
          const locName = item.label;

          if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
            vacancies.push({
              id,
              title,
              company,
              description: `Удаленная позиция ${title} в компании ${company} (${locName}). Подробности вакансии на Хабр Карьере.`,
              location: `${locName} (Удаленно)`,
              country: targetCis,
              employmentType: 'remote' as EmploymentType,
              salary: {
                raw: salaryText || 'По договоренности',
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
                'Опыт коммерческой веб-разработки',
                'Уверенное владение современным стеком и Git',
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
              tags: [locName, 'Remote', 'СНГ', spec],
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        console.warn(`HabrCareer scraper error on query ${item.q}:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
