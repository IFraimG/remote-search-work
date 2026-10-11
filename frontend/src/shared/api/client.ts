import {
  VacanciesFilterParams,
  PaginatedVacanciesResponse,
  StatusResponse,
} from '../types/index.js';

// Resolve API base URL: prefer env var, fallback to relative (which Netlify proxies to Render), or direct Render URL
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    // When hosted on Netlify, we can either use the proxy or call the live Render backend
    return '';
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

async function handleResponse<T>(response: Response, _endpoint: string): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const preview = text.slice(0, 150).replace(/\s+/g, ' ');
    throw new Error(
      `Сервер вернул ответ в формате ${contentType || 'text'} вместо JSON (HTTP ${response.status}). Возможно, бэкенд просыпается. Ответ: "${preview}..."`
    );
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) errorDetail = errorJson.message;
    } catch {
      // ignore
    }
    throw new Error(`Ошибка загрузки данных: ${errorDetail}`);
  }

  return response.json();
}

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

  return handleResponse<PaginatedVacanciesResponse>(response, endpoint);
}

export async function fetchStatus(): Promise<StatusResponse> {
  const endpoint = `${API_BASE_URL}/api/status`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });
  return handleResponse<StatusResponse>(response, endpoint);
}

export async function triggerRefresh(): Promise<void> {
  const endpoint = `${API_BASE_URL}/api/refresh`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  });
  return handleResponse<void>(response, endpoint);
}

export async function translateVacancyData(
  payload: import('../types/index.js').TranslateVacancyPayload
): Promise<import('../types/index.js').TranslatedVacancyData> {
  const endpoint = `${API_BASE_URL}/api/translate`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const res = await handleResponse<{
    success: boolean;
    data: import('../types/index.js').TranslatedVacancyData;
  }>(response, endpoint);

  return res.data;
}

