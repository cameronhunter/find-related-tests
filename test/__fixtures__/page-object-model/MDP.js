/**
 * @tag mdp
 */

import { Menu } from './Menu';

type Page = any;

export class MDP {
  static async from(page: Page) {
    return new MDP(page);
  }

  #page: Page;

  private constructor(page: Page) {
    this.#page = page;
  }

  async addToMyList(): Promise<void> {
    const menu = await Menu.from(this.#page);
    await menu.selectItem('Add to My List');
  }
}
