import {
  VacanciesFilterParams,
  PaginatedVacanciesResponse,
  StatusResponse,
} from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchVacancies(
  params: VacanciesFilterParams = {}
): Promise<PaginatedVacanciesResponse> {
  const query = new URLSearchParams();

  if (params.country) query.set('country', params.country);
  if (params.category) query.set('category', params.category);
  if (params.specialization && params.specialization !== 'all') {
    query.set('specialization', params.specialization);
  }
  if (params.employmentType && params.employmentType !== 'all') {
    query.set('employmentType', params.employmentType);
  }
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const endpoint = `${API_BASE_URL}/api/vacancies?${query.toString()}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) errorDetail = errorJson.message;
    } catch {
      // ignore
    }
    throw new Error(`Ошибка загрузки вакансий: ${errorDetail}`);
  }

  return response.json();
}

export async function fetchStatus(): Promise<StatusResponse> {
  const endpoint = `${API_BASE_URL}/api/status`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Не удалось получить статус скраперов`);
  }
  return response.json();
}

export async function triggerRefresh(): Promise<void> {
  const endpoint = `${API_BASE_URL}/api/refresh`;
  const response = await fetch(endpoint, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Ошибка запуска обновления`);
  }
}
