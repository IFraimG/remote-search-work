import cron from 'node-cron';
import { vacanciesService } from '../modules/vacancies/vacancies.service.js';
import { config } from '../config/env.js';

export function startScraperScheduler() {
  console.log(`[Scheduler] Initializing background scraper job (every ${config.scraperIntervalMinutes} minutes)...`);

  // Run initial scraping sync upon server startup
  vacanciesService.syncAll().catch((err) => {
    console.error('[Scheduler] Initial sync failed:', err);
  });

  // Schedule cron expression: "*/10 * * * *" (every 10 minutes)
  const cronExpression = `*/${config.scraperIntervalMinutes} * * * *`;
  cron.schedule(cronExpression, async () => {
    console.log(`[Scheduler] 10-minute cron interval triggered. Running scheduled scraping...`);
    try {
      await vacanciesService.syncAll();
      console.log(`[Scheduler] Scheduled scraping completed successfully.`);
    } catch (err) {
      console.error(`[Scheduler] Scheduled scraping encountered an error:`, err);
    }
  });

  console.log(`[Scheduler] Job scheduled with expression: "${cronExpression}"`);
}
