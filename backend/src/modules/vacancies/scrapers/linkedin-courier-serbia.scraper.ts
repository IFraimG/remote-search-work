import { LinkedInBaseScraper } from './linkedin-base.scraper.js';
import { CATEGORIES } from '../../../config/constants.js';

export class LinkedInCourierSerbiaScraper extends LinkedInBaseScraper {
  readonly id = 'linkedin-courier-serbia';
  readonly name = 'LinkedIn (Курьеры Сербия)';
  readonly targetCountry = 'RS';
  readonly category = CATEGORIES.COURIER;
  readonly locationQuery = 'Serbia';
  readonly defaultLocationText = 'Belgrade, Serbia';

  readonly keywords = [
    'Courier',
    'Delivery Driver',
    'Dostavljac',
    'Kurir',
  ];
}
