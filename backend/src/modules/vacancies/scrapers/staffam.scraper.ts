import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

interface StaffAmJobItem {
  id: number;
  title?: { en?: string; ru?: string; am?: string };
  companiesStruct?: { title?: { en?: string; ru?: string; am?: string } };
  job_city?: { title?: { en?: string; ru?: string; am?: string } };
  is_remote?: boolean;
  salary_from?: number | null;
  salary_to?: number | null;
  salary_currency?: string | null;
  category?: { code?: string; title?: { en?: string; ru?: string } };
  slug?: { en?: string; ru?: string; am?: string };
  activated_at?: { staffam?: string };
  skills?: Array<{ title?: { en?: string; ru?: string } } | string>;
}

export class StaffAmScraper extends BaseScraper {
  readonly id = 'staffam_armenia';
  readonly name = 'Staff.am (Armenia)';
  readonly targetCountry = 'armenia';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const searchKeywords = ['frontend', 'react', 'vue', 'fullstack', 'javascript', 'node'];

    for (const keyword of searchKeywords) {
      try {
        const url = `https://staff.am/en/jobs?JobsSearch%5Bkeyword%5D=${encodeURIComponent(keyword)}`;
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
              'Компания в Армении';

            const city = item.job_city?.title?.en || item.job_city?.title?.ru || 'Yerevan';
            const location = `${city}, Armenia`;
            const categoryCode = item.category?.code || 'it';
            const slug = item.slug?.en || item.slug?.ru || String(item.id);
            const sourceUrl = `https://staff.am/en/jobs/${categoryCode}/${slug}`;

            const cur = item.salary_currency || 'AMD';
            let rawSalary = 'По договоренности';
            if (item.salary_from && item.salary_to) {
              rawSalary = `${item.salary_from.toLocaleString()} - ${item.salary_to.toLocaleString()} ${cur}`;
            } else if (item.salary_from) {
              rawSalary = `от ${item.salary_from.toLocaleString()} ${cur}`;
            } else if (item.salary_to) {
              rawSalary = `до ${item.salary_to.toLocaleString()} ${cur}`;
            }

            const empType: EmploymentType = item.is_remote ? 'remote' : 'office';
            const spec = this.matchSpecialization(title);
            const extractedSkills = Array.isArray(item.skills)
              ? item.skills
                  .map((s) => (typeof s === 'string' ? s : s.title?.en || s.title?.ru || ''))
                  .filter(Boolean)
              : [];
            const id = `staffam_${item.id}`;

            if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
              vacancies.push({
                id,
                title,
                company,
                description: `Вакансия ${title} в компании ${company} (${location}). Подробности и отклик на Staff.am.`,
                location,
                country: 'armenia',
                city,
                employmentType: empType,
                salary: {
                  raw: rawSalary,
                  currency: cur,
                  min: item.salary_from || undefined,
                  max: item.salary_to || undefined,
                  isNegotiable: !item.salary_from && !item.salary_to,
                },
                requirements: this.extractRequirements(title, `${title} at ${company}`, extractedSkills),
                experience: title.toLowerCase().includes('senior')
                  ? 'Senior (3+ года)'
                  : title.toLowerCase().includes('junior')
                  ? 'Junior (1+ год)'
                  : 'Middle (2+ года)',
                source: 'Staff.am',
                sourceUrl,
                category: 'it',
                specialization: spec,
                tags: ['Армения', 'Staff.am', spec, empType],
                scrapedAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (e) {
        console.warn(`Staff.am scrape keyword "${keyword}" issue:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
