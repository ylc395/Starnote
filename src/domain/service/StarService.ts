import { StarRepository } from 'domain/repository/StarRepository';
import { container } from 'tsyringe';

import { Star, Note } from 'domain/entity';
import { StarList } from 'domain/entity/StarList';
import { intersectionBy, unionBy, without } from 'lodash';
import { computed } from '@vue/reactivity';
import { AppEventBus, AppEvents } from './AppEventBus';

export const token = Symbol();
export class StarService {
  private readonly appEventBus = container.resolve(AppEventBus);
  private readonly starRepository = container.resolve(StarRepository);
  private readonly starList = container.resolve(StarList);

  get stars() {
    return computed(() => this.starList.stars.value);
  }

  get sortedStars() {
    return this.starList.sortedStars;
  }

  constructor() {
    this.loadStars();
    this.appEventBus.on(AppEvents.ITEM_DELETED, this.loadStars, this);
  }

  private async loadStars() {
    const allStars = await this.starRepository.fetchAll();
    const existedStars = this.starList.stars.value;

    this.starList.stars.value = unionBy(
      intersectionBy(existedStars, allStars, 'entityId'),
      allStars,
      'entityId',
    );
  }

  addStar(note: Note) {
    const newStar = new Star(note);
    this.starList.stars.value = [...this.starList.stars.value, newStar];
    return this.starRepository.createStar(newStar);
  }

  removeStar(star: Star) {
    this.starRepository.deleteStar(star);
    this.starList.stars.value = without(this.starList.stars.value, star);
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
