import { FastifyInstance } from 'fastify';
import { getRatesHandler } from './rates.controller.js';

export async function ratesRoutes(fastify: FastifyInstance) {
  fastify.get('/api/rates', getRatesHandler);
}
