import { LinkedInBaseScraper } from './linkedin-base.scraper.js';
import { CATEGORIES } from '../../../config/constants.js';

export class LinkedInCourierArmeniaScraper extends LinkedInBaseScraper {
  readonly id = 'linkedin-courier-armenia';
  readonly name = 'LinkedIn (Курьеры Армения)';
  readonly targetCountry = 'AM';
  readonly category = CATEGORIES.COURIER;
  readonly locationQuery = 'Yerevan, Armenia';
  readonly defaultLocationText = 'Yerevan, Armenia';

  readonly keywords = [
    'Courier',
    'Delivery Driver',
  ];
}
