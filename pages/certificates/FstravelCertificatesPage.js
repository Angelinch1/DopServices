const { BasePage } = require('../BasePage');

const CERTIFICATES_PATH = '/certificates';

class FstravelCertificatesPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(CERTIFICATES_PATH, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { FstravelCertificatesPage, CERTIFICATES_PATH };
