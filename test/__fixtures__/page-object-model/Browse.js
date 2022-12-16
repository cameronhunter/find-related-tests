/**
 * @tag browse
 */

type Page = any;

export class Browse {
  static async from(page: Page) {
    return new Browse(page);
  }

  #page: Page;

  private constructor(page: Page) {
    this.#page = page;
  }

  async selectInAppMenu(text: string) {
    return Promise.resolve();
  }
}
