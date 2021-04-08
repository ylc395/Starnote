import { StarRepository } from 'domain/repository/StarRepository';
import { container } from 'tsyringe';

import {
  Star,
  Note,
  StarList,
  ItemTree,
  ItemTreeEvents,
  TreeItem,
} from 'domain/entity';
import { computed } from '@vue/reactivity';

export const token = Symbol();
export class StarService {
  private readonly starRepository = container.resolve(StarRepository);
  private readonly starList = container.resolve(StarList);
  readonly itemTree = container.resolve(ItemTree);

  get sortedStars() {
    return this.starList.sortedStars;
  }

  constructor() {
    this.itemTree
      .on(ItemTreeEvents.Loaded, this.initStars, this)
      .on(ItemTreeEvents.Deleted, this.removeStarsByEntity, this);
  }

  private async initStars() {
    const allStars = await this.starRepository.fetchAll();

    for (const star of allStars) {
      star.entity.value = this.itemTree.indexedNotes.get(star.entityId);
    }

    this.starList.stars.push(...allStars);
  }

  addStar(note: Note) {
    const newStar = this.starList.addStar(note);
    return this.starRepository.createStar(newStar);
  }

  removeStars(...stars: Star[]) {
    this.starList.removeStars(...stars);
    this.starRepository.deleteStars(...stars);
  }

  removeStarsByEntity(item: TreeItem) {
    const stars = this.starList.removeStarsByEntity(item);

    if (stars) {
      this.starRepository.deleteStars(...stars);
    }
  }

  setSortOrders(items: Star[]) {
    items.forEach((item, index) => {
      item.sortOrder.value = index + 1;
      this.starRepository.updateStar(item);
    });
  }

  isStar(entity: Note) {
    return computed(() => this.starList.contains(entity));
  }
}
