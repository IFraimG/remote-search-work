import { LinkedInBaseScraper } from './linkedin-base.scraper.js';
import { CATEGORIES } from '../../../config/constants.js';

export class LinkedInArmeniaScraper extends LinkedInBaseScraper {
  readonly id = 'linkedin-armenia';
  readonly name = 'LinkedIn (Армения IT)';
  readonly targetCountry = 'AM';
  readonly category = CATEGORIES.IT;
  readonly locationQuery = 'Armenia';
  readonly defaultLocationText = 'Yerevan, Armenia';

  readonly keywords = [
    'Frontend Developer',
    'React Developer',
    'JavaScript Developer',
    'Node.js Developer',
    'Web Developer',
  ];
}
