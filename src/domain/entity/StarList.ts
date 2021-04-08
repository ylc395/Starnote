import { computed, shallowReactive } from '@vue/reactivity';
import { singleton } from 'tsyringe';
import { Star } from './Star';
import { Note } from './Note';
import { pull, remove } from 'lodash';
import { Notebook } from './Notebook';

@singleton()
export class StarList {
  stars: Star[] = shallowReactive([]);
  sortedStars = computed(() => {
    const sorted = this.stars.slice();
    sorted.sort((star1, star2) => {
      if (star1.sortOrder.value === star2.sortOrder.value) {
        return star1.userCreatedAt.value.isAfter(star2.userCreatedAt.value)
          ? 1
          : -1;
      }

      return star1.sortOrder.value > star2.sortOrder.value ? 1 : -1;
    });

    return sorted;
  });

  addStar(note: Note) {
    const newStar = Star.from({ entity: note });
    this.stars.push(newStar);

    return newStar;
  }

  removeStars(...stars: Star[]) {
    pull(this.stars, ...stars);
  }

  removeStarsByEntity(entity: Note | Notebook) {
    if (Note.isA(entity)) {
      return remove(this.stars, (star) => star.entity.value?.isEqual(entity));
    }

    if (Notebook.isA(entity)) {
      return remove(this.stars, (star) =>
        star.entity.value?.isDescendenceOf(entity),
      );
    }
  }

  contains(entity: Note) {
    return !!this.stars.find((star) => star.entity.value?.isEqual(entity));
  }
}
