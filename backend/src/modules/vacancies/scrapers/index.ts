import { BaseScraper } from './base.scraper.js';
import { InfostudScraper } from './infostud.scraper.js';
import { LakoDoPoslaScraper } from './lakodoposla.scraper.js';
import { StaffAmScraper } from './staffam.scraper.js';
import { JobAmScraper } from './jobam.scraper.js';
import { CareerCenterScraper } from './careercenter.scraper.js';
import { JobsGeScraper } from './jobsge.scraper.js';
import { HrGeScraper } from './hrge.scraper.js';
import { HimalayasScraper } from './himalayas.scraper.js';
import { WeWorkRemotelyScraper } from './weworkremotely.scraper.js';
import { WorkingNomadsScraper } from './workingnomads.scraper.js';
import { ItJobsPtScraper } from './itjobspt.scraper.js';
import { ReedUkScraper } from './reeduk.scraper.js';
import { JobsinNetworkScraper } from './jobsinnetwork.scraper.js';
import { RemoteRocketshipScraper } from './remoterocketship.scraper.js';
import { HabrCareerScraper } from './habrcareer.scraper.js';
import { VSetiScraper } from './vseti.scraper.js';
import { CourierInfostudScraper } from './courier-infostud.scraper.js';
import { CourierLakoDoPoslaScraper } from './courier-lakodoposla.scraper.js';
import { CourierStaffAmScraper } from './courier-staffam.scraper.js';
import { CourierJobAmScraper } from './courier-jobam.scraper.js';
import { LinkedInSerbiaScraper } from './linkedin-serbia.scraper.js';
import { LinkedInArmeniaScraper } from './linkedin-armenia.scraper.js';
import { LinkedInRemoteScraper } from './linkedin-remote.scraper.js';
import { LinkedInCourierSerbiaScraper } from './linkedin-courier-serbia.scraper.js';
import { LinkedInCourierArmeniaScraper } from './linkedin-courier-armenia.scraper.js';

export function createDefaultScrapers(): BaseScraper[] {
  return [
    // Serbia IT
    new InfostudScraper(),
    new LakoDoPoslaScraper(),
    new LinkedInSerbiaScraper(),
    // Armenia IT
    new StaffAmScraper(),
    new JobAmScraper(),
    new CareerCenterScraper(),
    new LinkedInArmeniaScraper(),
    // Georgia IT (CIS)
    new JobsGeScraper(),
    new HrGeScraper(),
    // Global Remote & Europe / USA
    new HimalayasScraper(),
    new WeWorkRemotelyScraper(),
    new WorkingNomadsScraper(),
    new ItJobsPtScraper(),
    new ReedUkScraper(),
    new JobsinNetworkScraper(),
    new RemoteRocketshipScraper(),
    new HabrCareerScraper(),
    new VSetiScraper(),
    new LinkedInRemoteScraper(),
    // Couriers (Serbia & Armenia)
    new CourierInfostudScraper(),
    new CourierLakoDoPoslaScraper(),
    new LinkedInCourierSerbiaScraper(),
    new CourierStaffAmScraper(),
    new CourierJobAmScraper(),
    new LinkedInCourierArmeniaScraper(),
  ];
}

export {
  BaseScraper,
  InfostudScraper,
  LakoDoPoslaScraper,
  StaffAmScraper,
  JobAmScraper,
  CareerCenterScraper,
  JobsGeScraper,
  HrGeScraper,
  HimalayasScraper,
  WeWorkRemotelyScraper,
  WorkingNomadsScraper,
  ItJobsPtScraper,
  ReedUkScraper,
  JobsinNetworkScraper,
  RemoteRocketshipScraper,
  HabrCareerScraper,
  VSetiScraper,
  CourierInfostudScraper,
  CourierLakoDoPoslaScraper,
  CourierStaffAmScraper,
  CourierJobAmScraper,
  LinkedInSerbiaScraper,
  LinkedInArmeniaScraper,
  LinkedInRemoteScraper,
  LinkedInCourierSerbiaScraper,
  LinkedInCourierArmeniaScraper,
};
