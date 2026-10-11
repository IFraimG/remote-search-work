import { LinkedInBaseScraper } from './linkedin-base.scraper.js';
import { CATEGORIES } from '../../../config/constants.js';

export class LinkedInSerbiaScraper extends LinkedInBaseScraper {
  readonly id = 'linkedin-serbia';
  readonly name = 'LinkedIn (Сербия IT)';
  readonly targetCountry = 'RS';
  readonly category = CATEGORIES.IT;
  readonly locationQuery = 'Serbia';
  readonly defaultLocationText = 'Belgrade, Serbia';

  readonly keywords = [
    'Frontend Developer',
    'JavaScript Developer',
    'React Developer',
    'Vue Developer',
    'Fullstack Developer',
  ];
}
