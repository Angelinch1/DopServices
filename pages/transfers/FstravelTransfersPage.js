const { BasePage } = require('../BasePage');

const TRANSFERS_PATH = '/searchtransfers';

class FstravelTransfersPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(TRANSFERS_PATH, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { FstravelTransfersPage, TRANSFERS_PATH };
