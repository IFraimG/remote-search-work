import { FastifyInstance } from 'fastify';
import {
  getVacanciesHandler,
  getCategoriesHandler,
  getCountriesHandler,
  getStatusHandler,
  refreshHandler,
} from './vacancies.controller.js';

export async function vacanciesRoutes(fastify: FastifyInstance) {
  fastify.get('/api/vacancies', getVacanciesHandler);
  fastify.get('/api/categories', getCategoriesHandler);
  fastify.get('/api/countries', getCountriesHandler);
  fastify.get('/api/status', getStatusHandler);
  fastify.post('/api/refresh', refreshHandler);
}
