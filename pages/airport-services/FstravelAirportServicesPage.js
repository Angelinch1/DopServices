const { BasePage } = require('../BasePage');

const AIRPORT_SERVICES_PATH = '/searchairportservices';

class FstravelAirportServicesPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(AIRPORT_SERVICES_PATH, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { FstravelAirportServicesPage, AIRPORT_SERVICES_PATH };
