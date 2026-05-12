const { BasePage } = require('../BasePage');

const SEARCH_INSURANCES_PATH = '/searchinsurances';

class FstravelSearchInsurancesPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(SEARCH_INSURANCES_PATH, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { FstravelSearchInsurancesPage, SEARCH_INSURANCES_PATH };
