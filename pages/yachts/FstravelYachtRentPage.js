const { BasePage } = require('../BasePage');

const YACHT_RENT_PATH = '/searchyachtrent';

class FstravelYachtRentPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(YACHT_RENT_PATH, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { FstravelYachtRentPage, YACHT_RENT_PATH };
