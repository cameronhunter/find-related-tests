/**
 * @tag profiles
 */

import { Menu } from './Menu';

type Page = any;

export class Profiles {
  static async from(page: Page) {
    return new Profiles(page);
  }

  #page: Page;

  private constructor(page: Page) {
    this.#page = page;
  }

  async selectProfile(index: number = 0) {
    const menu = await Menu.from(this.#page);
    await menu.selectItemByIndex(index);
  }
}
