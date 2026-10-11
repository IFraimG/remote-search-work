import * as cheerio from 'cheerio';
import { BaseScraper } from './base.scraper.js';
import { Vacancy } from '../types.js';
import { CATEGORIES } from '../../../config/constants.js';

export class LakoDoPoslaScraper extends BaseScraper {
  readonly id = 'lakodoposla';
  readonly name = 'Lako do posla (Srbija)';
  readonly targetCountry = 'RS';
  readonly category = CATEGORIES.IT;

  protected async scrape(): Promise<Vacancy[]> {
    const urls = [
      'https://www.lakodoposla.com/posao-it-softver',
      'https://www.lakodoposla.com/pretraga-poslova?keywords=frontend',
      'https://www.lakodoposla.com/pretraga-poslova?keywords=developer',
    ];

    const vacancies: Vacancy[] = [];
    const seenUrls = new Set<string>();

    for (const searchUrl of urls) {
      try {
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'sr-RS,sr;q=0.9,en;q=0.8',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Search job items across common listing containers on lakodoposla
        const jobElements = $('.job-item, .job-listing, .oglas-item, article.job, .search-result-item');

        jobElements.each((_, el) => {
          const $el = $(el);
          const title = this.cleanText(
            $el.find('.job-title, h2, h3, a.title, .naziv-oglasa').first().text()
          );
          if (!title) return;

          const linkPath = $el.find('a').attr('href') || '';
          const fullUrl = linkPath.startsWith('http')
            ? linkPath
            : `https://www.lakodoposla.com${linkPath.startsWith('/') ? linkPath : '/' + linkPath}`;

          if (seenUrls.has(fullUrl)) return;
          seenUrls.add(fullUrl);

          const company =
            this.cleanText($el.find('.company-name, .poslodavac, .company, .emp-name').first().text()) ||
            'IT Poslodavac Srbija';

          const locationText =
            this.cleanText($el.find('.location, .grad, .mesto, .job-location').first().text()) || 'Beograd / Remote';

          const snippet =
            this.cleanText($el.find('.description, .opis, p, .snippet').first().text()) ||
            `Pozicija ${title} u kompaniji ${company}.`;

          const lower = (title + ' ' + snippet).toLowerCase();
          const employmentType: 'remote' | 'hybrid' | 'office' =
            lower.includes('remote') || lower.includes('od kuće') || lower.includes('daljinu')
              ? 'remote'
              : lower.includes('hibrid') || lower.includes('hybrid')
                ? 'hybrid'
                : 'office';

          const spec = this.matchSpecialization(title + ' ' + snippet);

          vacancies.push({
            id: `lakodoposla-${Math.abs(this.hashCode(fullUrl))}`,
            title,
            company,
            description: snippet.slice(0, 400),
            location: locationText.includes('Srbija') ? locationText : `${locationText}, Srbija`,
            country: 'RS',
            employmentType,
            salary: {
              raw: 'Po dogovoru',
              currency: 'RSD',
              isNegotiable: true,
            },
            requirements: ['JavaScript / TypeScript', 'Web Development', 'Timski rad'],
            experience: lower.includes('senior') ? 'Senior (3+ god)' : lower.includes('junior') ? 'Junior' : 'Medior',
            source: this.name,
            sourceUrl: fullUrl,
            category: this.category,
            specialization: spec,
            tags: [spec, 'Srbija', employmentType],
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[LakoDoPosla] Fetch failed for ${searchUrl}:`, (err as Error).message);
      }
    }

    return vacancies;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
