import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { config } from './config/env.js';
import { vacanciesRoutes } from './modules/vacancies/vacancies.routes.js';
import { translateRoutes } from './modules/translate/translate.routes.js';

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: true,
    trustProxy: true,
  });

  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  // Enable CORS
  await server.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return cb(null, true);
      // In development allow any localhost
      if (config.nodeEnv === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return cb(null, true);
      }
      // Check configured origins
      if (config.corsOrigin.includes(origin) || config.corsOrigin.includes('*')) {
        return cb(null, true);
      }
      return cb(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Fastify utilities & errors
  await server.register(sensible);

  // Healthcheck endpoint for Docker & Render.com
  server.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'remote-search-work-backend',
  }));

  // Register Vacancies module routes
  await server.register(vacanciesRoutes);

  // Register Translation module routes
  await server.register(translateRoutes);

  return server;
}
