import { BaseScraper } from './base.scraper.js';
import { InfostudScraper } from './infostud.scraper.js';
import { StaffAmScraper } from './staffam.scraper.js';
import { RemotiveScraper } from './remotive.scraper.js';
import { WeWorkRemotelyScraper } from './weworkremotely.scraper.js';
import { HabrCareerScraper } from './habrcareer.scraper.js';
import { CourierScraper } from './courier.scraper.js';

export function createDefaultScrapers(): BaseScraper[] {
  return [
    new InfostudScraper(),
    new StaffAmScraper(),
    new RemotiveScraper(),
    new WeWorkRemotelyScraper(),
    new HabrCareerScraper(),
    new CourierScraper(),
  ];
}

export {
  BaseScraper,
  InfostudScraper,
  StaffAmScraper,
  RemotiveScraper,
  WeWorkRemotelyScraper,
  HabrCareerScraper,
  CourierScraper,
};
