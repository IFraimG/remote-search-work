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
    return 'Frontend Developer';
  }
}
