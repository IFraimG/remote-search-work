import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';

export abstract class LinkedInBaseScraper extends BaseScraper {
  abstract readonly keywords: string[];
  abstract readonly locationQuery: string;
  abstract readonly defaultLocationText: string;

  protected async scrape(): Promise<Vacancy[]> {
    const vacancies: Vacancy[] = [];
    const seenUrls = new Set<string>();

    for (const kw of this.keywords) {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
        kw
      )}&location=${encodeURIComponent(this.locationQuery)}&start=0`;

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'navigate',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
          // If 429/999 or blocked, continue to next query or exit
          continue;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        $('li').each((_, el) => {
          const $el = $(el);
          const title = this.cleanText(
            $el.find('.base-search-card__title, h3, .job-search-card__title').first().text()
          );
          if (!title || title.length < 3) return;

          const rawLink =
            $el.find('a.base-card__full-link, a[href*="/jobs/view/"]').first().attr('href') ||
            $el.find('a').first().attr('href') ||
            '';

          if (!rawLink) return;

          // Strip tracking queries for clean direct link
          const cleanLink = rawLink.split('?')[0];
          if (seenUrls.has(cleanLink)) return;
          seenUrls.add(cleanLink);

          const company =
            this.cleanText(
              $el.find('.base-search-card__subtitle a, .base-search-card__subtitle, h4').first().text()
            ) || 'LinkedIn Employer';

          const locationText =
            this.cleanText($el.find('.job-search-card__location').first().text()) ||
            this.defaultLocationText;

          const salaryRaw = this.cleanText(
            $el.find('.job-search-card__salary-info, .salary').first().text()
          );

          const lower = (title + ' ' + locationText).toLowerCase();
          const empType: 'remote' | 'hybrid' | 'office' =
            lower.includes('remote')
              ? 'remote'
              : lower.includes('hybrid')
                ? 'hybrid'
                : 'office';

          const spec =
            this.category === 'courier'
              ? 'Курьер / Доставка'
              : this.matchSpecialization(title);

          const cur =
            this.targetCountry === 'RS'
              ? 'RSD'
              : this.targetCountry === 'AM'
                ? 'AMD'
                : 'USD';

          vacancies.push({
            id: `linkedin-${Math.abs(this.hashCode(cleanLink))}`,
            title,
            company,
            description: `Вакансия «${title}» в компании ${company} (${locationText}). Опубликовано в LinkedIn.`,
            location: locationText,
            country: this.targetCountry,
            employmentType: empType,
            salary: {
              raw: salaryRaw || 'По договоренности / Указано в LinkedIn',
              currency: cur,
              isNegotiable: true,
            },
            requirements:
              this.category === 'courier'
                ? ['Водительское удостоверение / личный транспорт', 'Ответственность и пунктуальность', 'Знание города']
                : ['Опыт разработки ПО', 'Профильные технологии (стек вакансии)', 'Английский язык'],
            experience: lower.includes('senior') ? 'Senior (3+ years)' : lower.includes('junior') ? 'Junior' : 'Middle',
            source: this.name,
            sourceUrl: cleanLink,
            category: this.category,
            specialization: spec,
            tags: [spec, 'LinkedIn', this.locationQuery],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[${this.name}] Fetch warning for query "${kw}":`, (err as Error).message);
      }
    }

    return vacancies;
  }

  protected hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
