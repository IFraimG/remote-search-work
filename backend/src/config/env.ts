import dotenv from 'dotenv';
import path from 'path';

// Load .env if present (ignored in git)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],
  scraperIntervalMinutes: Number(process.env.SCRAPER_INTERVAL_MINUTES) || 10,
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 600,
};
