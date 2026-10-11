import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';

interface StaffAmJobItem {
  id: number;
  title?: { en?: string; ru?: string; am?: string };
  companiesStruct?: { title?: { en?: string; ru?: string; am?: string } };
  job_city?: { title?: { en?: string; ru?: string; am?: string } };
  salary_from?: number | null;
  salary_to?: number | null;
  salary_currency?: string | null;
  category?: { code?: string; title?: { en?: string; ru?: string } };
  slug?: { en?: string; ru?: string; am?: string };
}

export class CourierStaffAmScraper extends BaseScraper {
  readonly id = 'courier_staffam';
  readonly name = 'Staff.am (Курьеры Армения)';
  readonly targetCountry = 'armenia';
  readonly category = 'courier';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const armenianQueries = ['courier', 'delivery', 'առաքիչ'];

    for (const query of armenianQueries) {
      try {
        const url = `https://staff.am/en/jobs?JobsSearch%5Bkeyword%5D=${encodeURIComponent(query)}`;
        const { statusCode, body } = await request(url, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,hy;q=0.8',
          },
          headersTimeout: 10000,
          bodyTimeout: 10000,
        });

        if (statusCode !== 200) continue;

        const html = await body.text();
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

        if (nextDataMatch) {
          const nextJson = JSON.parse(nextDataMatch[1]);
          const jobs: StaffAmJobItem[] = nextJson.props?.pageProps?.jobs || [];

          for (const item of jobs) {
            const title = item.title?.en || item.title?.ru || item.title?.am;
            if (!title) continue;

            const company =
              item.companiesStruct?.title?.en ||
              item.companiesStruct?.title?.ru ||
              'Служба доставки (Ереван)';

            const city = item.job_city?.title?.en || item.job_city?.title?.ru || 'Yerevan';
            const location = `${city}, Armenia`;
            const categoryCode = item.category?.code || 'delivery';
            const slug = item.slug?.en || item.slug?.ru || String(item.id);
            const sourceUrl = `https://staff.am/en/jobs/${categoryCode}/${slug}`;

            const cur = item.salary_currency || 'AMD';
            let rawSalary = '180,000 - 350,000 AMD';
            if (item.salary_from && item.salary_to) {
              rawSalary = `${item.salary_from.toLocaleString()} - ${item.salary_to.toLocaleString()} ${cur}`;
            } else if (item.salary_from) {
              rawSalary = `от ${item.salary_from.toLocaleString()} ${cur}`;
            }

            const id = `courier_am_${item.id}`;

            if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
              vacancies.push({
                id,
                title: title.toLowerCase().includes('courier') || title.toLowerCase().includes('delivery')
                  ? title
                  : `Курьер / Доставка: ${title}`,
                company,
                description: `Работа курьером / доставщиком в компании ${company} (${location}). Отклик и контакты на Staff.am.`,
                location,
                country: 'armenia',
                city,
                employmentType: 'office',
                salary: {
                  raw: rawSalary,
                  currency: cur,
                  min: item.salary_from || undefined,
                  max: item.salary_to || undefined,
                  isNegotiable: !item.salary_from && !item.salary_to,
                },
                requirements: [
                  'Знание города и умение ориентироваться по навигатору',
                  'Личный транспорт (авто/мото/скутер/велосипед) либо пеший курьер',
                ],
                experience: 'Без опыта / от 3 месяцев',
                source: 'Staff.am (Courier)',
                sourceUrl,
                category: 'courier',
                specialization: 'Курьер / Доставка',
                tags: ['Армения', 'Курьер', 'Доставка', 'Транспорт'],
                scrapedAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (e) {
        console.warn(`Staff.am Courier scrape error on query ${query}:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
