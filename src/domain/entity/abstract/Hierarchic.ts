import { Entity } from './Entity';
import { without } from 'lodash';
import type { Ref } from '@vue/reactivity';

export interface WithChildren extends Entity {
  readonly children: Ref<Entity[] | null>;
}

export abstract class Hierarchic<P extends WithChildren> extends Entity {
  abstract readonly parentId: Ref<P['id'] | null>;
  protected abstract readonly parent: Ref<P | null>;
  setParent(newParent: P, bidirectional = true) {
    const oldParent = this.parent.value;

    if (oldParent?.children?.value) {
      oldParent.children.value = without(oldParent.children.value, this);
    }

    this.parent.value = newParent;
    this.parentId.value = newParent.id;

    if (!bidirectional) {
      return;
    }

    if (!newParent.children.value) {
      newParent.children.value = [];
    }

    const childrenOfNewParent = newParent.children.value.filter(
      (entity) => !entity.isEqual(this),
    );
    childrenOfNewParent.push(this);
    newParent.children.value = [...childrenOfNewParent];
  }

  hasParent() {
    return !!this.parentId.value;
  }
}
