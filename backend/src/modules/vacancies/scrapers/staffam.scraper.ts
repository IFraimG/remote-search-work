import * as cheerio from 'cheerio';
import { request } from 'undici';
import { BaseScraper } from './base.scraper.js';
import { Vacancy, EmploymentType } from '../types.js';

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
          headersTimeout: 8000,
          bodyTimeout: 8000,
        });

        if (statusCode !== 200) {
          continue;
        }

        const html = await body.text();
        const $ = cheerio.load(html);

        // Parse search items on staff.am
        $('.job-inner, .load-more-item, [data-key], div.job_list_item').each((_, element) => {
          const $el = $(element);
          const title = this.cleanText(
            $el.find('.job_title, h2, h3, a.font_heavy, [class*="title"]').first().text()
          );
          if (!title || title.length < 3) return;

          const linkHref =
            $el.find('a[href*="/en/job/"], a[href*="/jobs/"], a.font_heavy').first().attr('href') || '';
          if (!linkHref) return;

          const sourceUrl = linkHref.startsWith('http')
            ? linkHref
            : `https://staff.am${linkHref}`;

          const company =
            this.cleanText(
              $el.find('.job_list_company_title, [class*="company"], .company-title').first().text()
            ) || 'IT Company (Armenia)';

          const locationText = this.cleanText(
            $el.find('.job_location, [class*="location"], .city_title').first().text()
          );

          const rawDesc = this.cleanText(
            $el.find('.job_description, p, [class*="description"]').first().text()
          );

          const rawSalary = this.cleanText(
            $el.find('.salary, [class*="salary"]').first().text()
          );

          let empType: EmploymentType = 'office';
          const fullText = (title + ' ' + locationText + ' ' + rawDesc).toLowerCase();
          if (fullText.includes('remote') || fullText.includes('work from home')) {
            empType = 'remote';
          } else if (fullText.includes('hybrid')) {
            empType = 'hybrid';
          }

          const spec = this.matchSpecialization(title + ' ' + rawDesc);
          const id = `staffam_${Buffer.from(sourceUrl).toString('base64url').slice(-24)}`;

          if (!vacancies.some((v) => v.sourceUrl === sourceUrl)) {
            vacancies.push({
              id,
              title,
              company,
              description: rawDesc || `Vacancy for ${title} at ${company} in Armenia. See details on Staff.am`,
              location: locationText || 'Yerevan, Armenia',
              country: 'armenia',
              city: locationText.includes('Yerevan') || locationText.includes('Երևան')
                ? 'Yerevan'
                : locationText || 'Armenia',
              employmentType: empType,
              salary: {
                raw: rawSalary || 'Negotiable',
                currency: rawSalary.includes('$') || rawSalary.includes('USD') ? 'USD' : 'AMD',
                isNegotiable: !rawSalary,
              },
              requirements: [
                'Bachelor degree in Computer Science or equivalent',
                'Demonstrated hands-on experience in modern frontend/fullstack stack',
              ],
              experience: fullText.includes('senior')
                ? 'Senior (3+ years)'
                : fullText.includes('junior')
                ? 'Junior (1+ years)'
                : 'Mid-level (2+ years)',
              source: 'Staff.am',
              sourceUrl,
              category: 'it',
              specialization: spec,
              tags: ['Armenia', 'IT', spec, empType],
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        console.warn(`Staff.am scrape keyword "${keyword}" issue:`, e instanceof Error ? e.message : e);
      }
    }

    return vacancies;
  }
}
