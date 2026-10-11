export type EmploymentType = 'remote' | 'hybrid' | 'office' | 'flexible';

export interface Salary {
  min?: number;
  max?: number;
  currency?: string;
  raw?: string;
  isNegotiable?: boolean;
}

export interface Vacancy {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  country: string;
  city?: string;
  employmentType: EmploymentType;
  salary: Salary;
  requirements: string[];
  experience?: string;
  source: string;
  sourceUrl: string;
  category: string; // 'it' | 'courier' | other extensible
  specialization: string;
  tags: string[];
  publishedAt?: string;
  scrapedAt: string;
}

export interface ScraperError {
  source: string;
  message: string;
  timestamp: string;
}

export interface ScraperStatus {
  sourceId: string;
  name: string;
  targetCountry: string;
  category: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRunAt?: string;
  vacanciesCount: number;
  lastError?: string;
}

export interface VacanciesQuery {
  country?: string;
  category?: string;
  specialization?: string;
  employmentType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedVacanciesResponse {
  data: Vacancy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  sourcesStatus: ScraperStatus[];
  errors: ScraperError[];
  lastSyncedAt: string;
  nextSyncAt: string;
}
