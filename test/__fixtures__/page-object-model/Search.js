/**
 * @tag search
 */

type Page = any;

export class Search {
  static async from(page: Page) {
    return new Search(page);
  }

  #page: Page;

  private constructor(page: Page) {
    this.#page = page;
  }

  async searchFor(text: string): Promise<void> {
    return Promise.resolve();
  }

  async selectResult(index: number) {
    return Promise.resolve();
  }
}
