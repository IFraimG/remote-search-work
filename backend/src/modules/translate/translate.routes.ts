import { FastifyInstance } from 'fastify';
import { translateHandler } from './translate.controller.js';

export async function translateRoutes(fastify: FastifyInstance) {
  fastify.post('/api/translate', translateHandler);
}
