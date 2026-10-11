import { FastifyRequest, FastifyReply } from 'fastify';
import { vacanciesService } from './vacancies.service.js';
import { VacanciesQuery } from './types.js';
import {
  SPECIALIZATIONS,
  CATEGORIES,
  COUNTRY_NAMES,
  ALLOWED_CIS_COUNTRIES,
} from '../../config/constants.js';

export async function getVacanciesHandler(
  request: FastifyRequest<{ Querystring: VacanciesQuery }>,
  reply: FastifyReply
) {
  const result = vacanciesService.getVacancies(request.query);
  return reply.send(result);
}

export async function getCategoriesHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    categories: [
      { id: CATEGORIES.IT, name: 'IT & Software Development' },
      { id: CATEGORIES.COURIER, name: 'Курьеры & Доставка' },
    ],
    specializations: SPECIALIZATIONS,
  });
}

export async function getCountriesHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    countries: Object.entries(COUNTRY_NAMES).map(([code, names]) => ({
      code,
      nameEn: names.en,
      nameRu: names.ru,
    })),
    allowedCisCountries: ALLOWED_CIS_COUNTRIES,
  });
}

export async function getStatusHandler(_request: FastifyRequest, reply: FastifyReply) {
  const sourcesStatus = vacanciesService.getSourcesStatus();
  const errors = vacanciesService.getErrors();
  const meta = vacanciesService.getSyncMeta();

  return reply.send({
    status: errors.length > 0 ? 'degraded' : 'healthy',
    sources: sourcesStatus,
    errors,
    meta,
  });
}

export async function refreshHandler(_request: FastifyRequest, reply: FastifyReply) {
  // Trigger async sync without blocking reply
  vacanciesService.syncAll().catch((err) => {
    console.error('[Refresh] Failed to sync:', err);
  });

  return reply.send({
    message: 'Scraping synchronization started',
    meta: vacanciesService.getSyncMeta(),
  });
}
