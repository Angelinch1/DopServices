const { BasePage } = require('../BasePage');

const HOTEL_SERVICES_PATH = '/searchhotelservices';

class FstravelHotelServicesPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(HOTEL_SERVICES_PATH, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { FstravelHotelServicesPage, HOTEL_SERVICES_PATH };
