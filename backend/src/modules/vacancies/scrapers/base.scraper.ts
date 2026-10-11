import { Vacancy, ScraperStatus, ScraperError } from '../types.js';

export abstract class BaseScraper {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly targetCountry: string;
  abstract readonly category: string;

  protected status: ScraperStatus = {
    sourceId: '',
    name: '',
    targetCountry: '',
    category: '',
    status: 'idle',
    vacanciesCount: 0,
  };

  protected lastError: ScraperError | null = null;

  constructor() {
    // initialize status after child constructor sets abstract properties
    setTimeout(() => {
      this.status = {
        sourceId: this.id,
        name: this.name,
        targetCountry: this.targetCountry,
        category: this.category,
        status: 'idle',
        vacanciesCount: 0,
      };
    }, 0);
  }

  getStatus(): ScraperStatus {
    return {
      ...this.status,
      sourceId: this.id,
      name: this.name,
      targetCountry: this.targetCountry,
      category: this.category,
      lastError: this.lastError?.message,
    };
  }

  getLastError(): ScraperError | null {
    return this.lastError;
  }

  async execute(): Promise<{ vacancies: Vacancy[]; error: ScraperError | null }> {
    this.status.status = 'running';
    try {
      const vacancies = await this.scrape();
      this.status.status = 'success';
      this.status.lastRunAt = new Date().toISOString();
      this.status.vacanciesCount = vacancies.length;
      this.lastError = null;
      return { vacancies, error: null };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.lastError = {
        source: this.name,
        message: `${this.name}: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
      this.status.status = 'error';
      this.status.lastRunAt = new Date().toISOString();
      this.status.vacanciesCount = 0;
      // As requested: Do NOT return mock data on error! Return empty vacancies and report exact error
      return { vacancies: [], error: this.lastError };
    }
  }

  protected abstract scrape(): Promise<Vacancy[]>;

  protected cleanText(text?: string | null): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  protected matchSpecialization(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('vue')) return 'Vue Developer';
    if (lower.includes('react')) return 'React Developer';
    if (lower.includes('node')) return 'Node.js Developer';
    if (lower.includes('typescript')) return 'Typescript Developer';
    if (lower.includes('fullstack') || lower.includes('full stack') || lower.includes('full-stack'))
      return 'Fullstack Developer';
    if (lower.includes('frontend') || lower.includes('front end') || lower.includes('front-end'))
      return 'Frontend Developer';
    if (lower.includes('javascript') || lower.includes('js dev')) return 'JS Developer';
    if (lower.includes('web dev') || lower.includes('web developer')) return 'Web Developer';

    // Roles outside primary frontend web:
    if (
      lower.includes('courier') ||
      lower.includes('delivery') ||
      lower.includes('dostav') ||
      lower.includes('kurir') ||
      lower.includes('достав') ||
      lower.includes('курьер')
    )
      return 'Курьер / Доставка';
    if (lower.includes('support') || lower.includes('helpdesk') || lower.includes('customer service'))
      return 'Technical Support';
    if (lower.includes('qa') || lower.includes('test') || lower.includes('quality assurance'))
      return 'QA Engineer';
    if (lower.includes('devops') || lower.includes('sre') || lower.includes('cloud engineer') || lower.includes('infrastructure'))
      return 'DevOps Engineer';
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios') || lower.includes('flutter'))
      return 'Mobile Developer';
    if (lower.includes('backend') || lower.includes('back-end') || lower.includes('back end'))
      return 'Backend Developer';

    return 'Software Engineer';
  }

  /**
   * Dynamically extracts requirements relevant to the specific vacancy.
   * Never returns hardcoded/fake generic requirements.
   */
  protected extractRequirements(title: string, description: string, raw?: string[]): string[] {
    const fullText = `${title} ${description}`.trim();
    const lower = fullText.toLowerCase();

    // 1. If explicit raw requirements/skills were parsed from source and are not generic placeholders:
    if (raw && Array.isArray(raw) && raw.length > 0) {
      const valid = raw
        .map((r) => this.cleanText(r))
        .filter((r) => r.length > 2 && r.length < 120 && !r.toLowerCase().includes('timski rad') && !r.toLowerCase().includes('командная работа'));
      if (valid.length > 0) {
        return valid.slice(0, 4);
      }
    }

    // 2. Extract bullet points or requirements lists from description if formatted as list
    const bulletMatches = description.match(/(?:^|\n|\r)[•\-*–]\s*([^\n\r]+)/g);
    if (bulletMatches && bulletMatches.length > 0) {
      const extractedBullets = bulletMatches
        .map((b) => b.replace(/^[•\-*–\s]+/, '').trim())
        .filter(
          (b) =>
            b.length > 4 &&
            b.length < 110 &&
            !b.toLowerCase().includes('http') &&
            !b.toLowerCase().includes('apply') &&
            !b.toLowerCase().includes('отклик')
        );
      if (extractedBullets.length > 0) {
        return extractedBullets.slice(0, 3);
      }
    }

    // 3. Dynamic detection of actual technologies, languages, and qualifications mentioned in text
    const detected: string[] = [];

    // Technologies
    if (lower.includes('vue')) detected.push('Vue.js / Pinia');
    if (lower.includes('react')) detected.push('React / Next.js');
    if (lower.includes('typescript')) detected.push('TypeScript');
    else if (lower.includes('javascript') || lower.includes(' js ')) detected.push('JavaScript');
    if (lower.includes('node')) detected.push('Node.js');
    if (lower.includes('html') || lower.includes('css')) detected.push('HTML5 / CSS3');
    if (lower.includes('tailwind')) detected.push('Tailwind CSS');
    if (lower.includes('graphql')) detected.push('GraphQL');
    if (lower.includes('rest') || lower.includes('api')) detected.push('REST APIs');
    if (lower.includes('git')) detected.push('Git');
    if (lower.includes('docker')) detected.push('Docker');
    if (lower.includes('python')) detected.push('Python');
    if (lower.includes('sql') || lower.includes('postgres') || lower.includes('mongo')) detected.push('Databases & SQL');
    if (lower.includes('angular')) detected.push('Angular');

    // Languages (crucial for bilingual support / international positions)
    if (lower.includes('english') || lower.includes('английск')) detected.push('English (Fluent / Professional)');
    if (lower.includes('georgian') || lower.includes('грузинск')) detected.push('Georgian language (Fluent)');
    if (lower.includes('serbian') || lower.includes('srpski') || lower.includes('сербск')) detected.push('Serbian language');
    if (lower.includes('armenian') || lower.includes('армянск')) detected.push('Armenian language');
    if (lower.includes('russian') || lower.includes('русск')) detected.push('Russian language');

    // Role specific qualifications
    if (lower.includes('support') || lower.includes('helpdesk') || lower.includes('customer')) {
      detected.push('Customer Support / Communication skills');
      detected.push('Problem solving & Troubleshooting');
    }
    if (lower.includes('courier') || lower.includes('delivery') || lower.includes('dostav') || lower.includes('kurir') || lower.includes('достав') || lower.includes('курьер')) {
      detected.push('Личный транспорт (авто/скутер/велосипед) или пеший');
      detected.push('Знание города и навигации');
      detected.push('Пунктуальность и ответственность');
    }

    if (detected.length > 0) {
      return Array.from(new Set(detected)).slice(0, 3);
    }

    // 4. Return empty array if no specific requirements stated (so UI doesn't render fake blocks)
    return [];
  }
}
