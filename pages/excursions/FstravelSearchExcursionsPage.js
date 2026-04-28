const { BasePage } = require('../BasePage');

const SEARCH_EXCURSIONS_PATH = '/searchexcursions';

class FstravelSearchExcursionsPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(SEARCH_EXCURSIONS_PATH, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { FstravelSearchExcursionsPage, SEARCH_EXCURSIONS_PATH };
