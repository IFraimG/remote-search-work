import { buildServer } from './server.js';
import { config } from './config/env.js';
import { startScraperScheduler } from './jobs/scheduler.js';

async function main() {
  try {
    const server = await buildServer();

    await server.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`[Server] Fastify running on http://${config.host}:${config.port}`);
    console.log(`[Server] Health check: http://${config.host}:${config.port}/health`);
    console.log(`[Server] API Vacancies: http://${config.host}:${config.port}/api/vacancies`);

    // Start background scraper job (runs every 10 minutes)
    startScraperScheduler();

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
        await server.close();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

main();
