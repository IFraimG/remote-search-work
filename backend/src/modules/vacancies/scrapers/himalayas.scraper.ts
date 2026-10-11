import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

interface HimalayasJob {
  title: string;
  excerpt?: string;
  companyName: string;
  applicationLink: string;
  locationRestrictions?: string[];
  employmentType?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  seniority?: string[] | null;
  categories?: Array<{ name: string; slug: string }> | null;
}

interface HimalayasResponse {
  jobs?: HimalayasJob[];
}

export class HimalayasScraper extends BaseScraper {
  readonly id = 'himalayas_remote';
  readonly name = 'Himalayas (Global Remote: Европа & США)';
  readonly targetCountry = 'global_remote';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const url = 'https://himalayas.app/jobs/api?limit=50';

    const { statusCode, body } = await request(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      headersTimeout: 10000,
      bodyTimeout: 10000,
    });

    if (statusCode !== 200) {
      throw new Error(`Himalayas API returned HTTP ${statusCode}`);
    }

    const data = (await body.json()) as HimalayasResponse;
    const jobs = data.jobs || [];

    for (const job of jobs) {
      if (!job.title || !job.applicationLink) continue;

      const titleLower = job.title.toLowerCase();
      // Only keep software / frontend / web / fullstack / js / react / vue / node jobs
      const isRelevant =
        titleLower.includes('frontend') ||
        titleLower.includes('front-end') ||
        titleLower.includes('front end') ||
        titleLower.includes('developer') ||
        titleLower.includes('engineer') ||
        titleLower.includes('fullstack') ||
        titleLower.includes('full-stack') ||
        titleLower.includes('react') ||
        titleLower.includes('vue') ||
        titleLower.includes('node') ||
        titleLower.includes('javascript') ||
        titleLower.includes('typescript') ||
        titleLower.includes('web');

      if (!isRelevant) continue;

      const locs = (job.locationRestrictions || []).join(' ');
      const locLower = (locs + ' ' + job.title).toLowerCase();

      let country = 'global_remote';
      if (locLower.includes('united states') || locLower.includes('usa') || locLower.includes('us')) {
        country = 'usa';
      } else if (locLower.includes('germany') || locLower.includes('berlin')) {
        country = 'germany';
      } else if (locLower.includes('united kingdom') || locLower.includes('uk') || locLower.includes('london')) {
        country = 'uk';
      } else if (locLower.includes('netherlands') || locLower.includes('amsterdam')) {
        country = 'netherlands';
      } else if (locLower.includes('poland') || locLower.includes('warsaw')) {
        country = 'poland';
      } else if (locLower.includes('france') || locLower.includes('paris')) {
        country = 'france';
      } else if (locLower.includes('spain') || locLower.includes('madrid')) {
        country = 'spain';
      } else if (locLower.includes('europe') || locLower.includes('emea')) {
        country = 'germany';
      }

      const spec = this.matchSpecialization(job.title + ' ' + (job.excerpt || ''));
      const id = `himalayas_${Buffer.from(job.applicationLink).toString('base64url').slice(-24)}`;

      let salaryRaw = 'Рыночная ставка';
      const cur = job.currency || 'USD';
      if (job.minSalary && job.maxSalary) {
        salaryRaw = `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} ${cur}/год`;
      } else if (job.minSalary) {
        salaryRaw = `от ${job.minSalary.toLocaleString()} ${cur}/год`;
      } else if (job.maxSalary) {
        salaryRaw = `до ${job.maxSalary.toLocaleString()} ${cur}/год`;
      }

      const experience =
        job.seniority && job.seniority.length
          ? job.seniority.join(', ')
          : titleLower.includes('senior')
          ? 'Senior (4+ года)'
          : titleLower.includes('junior')
          ? 'Junior (1+ год)'
          : 'Middle (2+ года)';

      vacancies.push({
        id,
        title: job.title,
        company: job.companyName || 'Tech Company',
        description:
          job.excerpt || `Удаленная позиция ${job.title} в компании ${job.companyName}. Локация: ${locs || 'Worldwide'}.`,
        location: locs || 'Worldwide (Удаленно)',
        country,
        city: undefined,
        employmentType: 'remote' as EmploymentType,
        salary: {
          raw: salaryRaw,
          currency: cur,
          min: job.minSalary || undefined,
          max: job.maxSalary || undefined,
          isNegotiable: !job.minSalary && !job.maxSalary,
        },
        requirements: [
          'Коммерческий опыт разработки на современном стеке',
          'Опыт работы в распределенной интернациональной команде',
        ],
        experience,
        source: 'Himalayas',
        sourceUrl: job.applicationLink,
        category: 'it',
        specialization: spec,
        tags: ['Remote', 'Himalayas', spec, country.toUpperCase()],
        scrapedAt: new Date().toISOString(),
      });
    }

    return vacancies;
  }
}
