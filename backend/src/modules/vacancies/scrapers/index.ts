import { BaseScraper } from './base.scraper.js';
import { InfostudScraper } from './infostud.scraper.js';
import { StaffAmScraper } from './staffam.scraper.js';
import { HimalayasScraper } from './himalayas.scraper.js';
import { WeWorkRemotelyScraper } from './weworkremotely.scraper.js';
import { HabrCareerScraper } from './habrcareer.scraper.js';
import { CourierInfostudScraper } from './courier-infostud.scraper.js';
import { CourierStaffAmScraper } from './courier-staffam.scraper.js';

export function createDefaultScrapers(): BaseScraper[] {
  return [
    new InfostudScraper(),
    new StaffAmScraper(),
    new HimalayasScraper(),
    new WeWorkRemotelyScraper(),
    new HabrCareerScraper(),
    new CourierInfostudScraper(),
    new CourierStaffAmScraper(),
  ];
}

export {
  BaseScraper,
  InfostudScraper,
  StaffAmScraper,
  HimalayasScraper,
  WeWorkRemotelyScraper,
  HabrCareerScraper,
  CourierInfostudScraper,
  CourierStaffAmScraper,
};
