import { LinkedInBaseScraper } from './linkedin-base.scraper.js';
import { CATEGORIES } from '../../../config/constants.js';

export class LinkedInRemoteScraper extends LinkedInBaseScraper {
  readonly id = 'linkedin-remote';
  readonly name = 'LinkedIn (Remote Europe & USA)';
  readonly targetCountry = 'ALL';
  readonly category = CATEGORIES.IT;
  readonly locationQuery = 'Worldwide';
  readonly defaultLocationText = 'Remote (Worldwide / Europe / USA)';

  readonly keywords = [
    'Frontend Developer Remote',
    'Fullstack Developer Remote',
    'React Developer Remote',
    'Vue Developer Remote',
    'TypeScript Developer Remote',
  ];
}
