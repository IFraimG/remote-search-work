import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

export class WeWorkRemotelyScraper extends BaseScraper {
  readonly id = 'weworkremotely_global';
  readonly name = 'We Work Remotely (Global Remote)';
  readonly targetCountry = 'global_remote';
  readonly category = 'it';

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const feeds = [
      'https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss',
      'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
    ];

    for (const feedUrl of feeds) {
      try {
        const { statusCode, body } = await request(feedUrl, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
          },
          headersTimeout: 10000,
          bodyTimeout: 10000,
        });

        if (statusCode !== 200) continue;

        const xml = await body.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').each((_, item) => {
          const $item = $(item);
          const rawTitle = this.cleanText($item.find('title').first().text());
          const link = this.cleanText($item.find('link').first().text());
          if (!rawTitle || !link) return;

          // Title often formatted as: "Company: Job Title"
          let company = 'Tech Company';
          let title = rawTitle;
          if (rawTitle.includes(':')) {
            const parts = rawTitle.split(':');
            company = parts[0].trim();
            title = parts.slice(1).join(':').trim();
          }

          const region = this.cleanText($item.find('region').first().text()) || 'Anywhere in the World';
          const skills = this.cleanText($item.find('skills').first().text());
          const descriptionHtml = $item.find('description').first().text();

          // Extract clean text from description HTML
          const desc$ = cheerio.load(descriptionHtml);
          const rawDesc = this.cleanText(desc$('p').text()) || `Remote position for ${title} at ${company}.`;

          const locLower = (region + ' ' + title).toLowerCase();
          let country = 'global_remote';
          if (locLower.includes('usa') || locLower.includes('us only') || locLower.includes('americas')) {
            country = 'usa';
          } else if (locLower.includes('germany') || locLower.includes('berlin')) {
            country = 'germany';
          } else if (locLower.includes('uk') || locLower.includes('united kingdom') || locLower.includes('london')) {
            country = 'uk';
          } else if (locLower.includes('netherlands') || locLower.includes('amsterdam')) {
            country = 'netherlands';
          } else if (locLower.includes('poland') || locLower.includes('warsaw')) {
            country = 'poland';
          } else if (locLower.includes('france') || locLower.includes('paris')) {
            country = 'france';
          } else if (locLower.includes('spain') || locLower.includes('madrid')) {
            country = 'spain';
          } else if (locLower.includes('europe') || locLower.includes('eu only')) {
            country = 'germany';
          }

          // Check for salary pattern in description e.g. "$80,000 - $120,000"
          let salaryRaw = 'Конкурентная ставка';
          const salaryMatch = descriptionHtml.match(/(\$[\d,]+(?:\s*[-–]\s*[$]?[\d,]+)?)/);
          if (salaryMatch) {
            salaryRaw = salaryMatch[1];
          }

          const spec = this.matchSpecialization(title + ' ' + skills);
          const id = `wwr_${Buffer.from(link).toString('base64url').slice(-24)}`;

          if (!vacancies.some((v) => v.sourceUrl === link)) {
            vacancies.push({
              id,
              title,
              company,
              description: rawDesc.slice(0, 300) + '...',
              location: region,
              country,
              city: undefined,
              employmentType: 'remote' as EmploymentType,
              salary: {
                raw: salaryRaw,
                currency: salaryRaw.includes('€') ? 'EUR' : 'USD',
                isNegotiable: !salaryMatch,
              },
              requirements: skills
                ? skills.split(',').map((s) => s.trim()).slice(0, 4)
                : ['Опыт создания современных веб-приложений', 'Опыт работы в распределенной команде'],
              experience: title.toLowerCase().includes('senior')
                ? 'Senior (4+ года)'
                : title.toLowerCase().includes('junior')
                ? 'Junior (1+ год)'
                : 'Middle (2+ года)',
              source: 'We Work Remotely',
              sourceUrl: link,
              category: 'it',
              specialization: spec,
              tags: ['Remote', 'WeWorkRemotely', spec, country.toUpperCase()],
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        console.warn(`WeWorkRemotely RSS error for ${feedUrl}:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
