import { StarRepository } from 'domain/repository/StarRepository';
import { container } from 'tsyringe';

import { ItemTree, Star, Note, TreeItem, ItemTreeEvents } from 'domain/entity';
import { StarList } from 'domain/entity/StarList';
import { pull } from 'lodash';

export const token = Symbol();
export class StarService {
  private readonly itemTree = container.resolve(ItemTree);
  private readonly starRepository = container.resolve(StarRepository);
  private readonly starList = container.resolve(StarList);

  get stars() {
    return this.starList.stars;
  }

  get sortedStars() {
    return this.starList.sortedStars;
  }

  constructor() {
    this.initStar();
  }

  private async initStar() {
    this.itemTree.on(ItemTreeEvents.Deleted, this.removeStar, this);
    this.stars.push(...(await this.starRepository.fetchAll()));
  }

  addStar(note: Note) {
    const newStar = new Star(note);
    this.stars.push(newStar);

    return this.starRepository.createStar(newStar);
  }

  removeStar(item: TreeItem) {
    const starToRemove = this.stars.find((star) =>
      star.entity.value?.isEqual(item),
    );

    if (!starToRemove) {
      return;
    }

    this.starRepository.deleteStar(starToRemove);
    pull(this.stars, starToRemove);
  }

  setSortOrders(items: Star[]) {
    items.forEach((item, index) => {
      item.sortOrder.value = index + 1;
      this.starRepository.updateStar(item);
    });
  }

  isStar(entity: Note) {
    return this.starList.contains(entity);
  }
}
