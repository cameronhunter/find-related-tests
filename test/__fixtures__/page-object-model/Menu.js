/**
 * @tag menu
 */

type Page = any;

export class Menu {
  static async from(page: Page) {
    return new Menu(page);
  }

  #page: Page;

  private constructor(page: Page) {
    this.#page = page;
  }

  async selectItemByIndex(index: number): Promise<void> {
    return Promise.resolve();
  }

  async selectItem(text: string): Promise<void> {
    return Promise.resolve();
  }
}
