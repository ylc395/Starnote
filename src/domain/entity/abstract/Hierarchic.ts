import { Entity } from './Entity';
import { without } from 'lodash';
import type { Ref } from '@vue/reactivity';

export interface WithChildren extends Entity {
  readonly children: Ref<Entity[] | null>;
}

export abstract class Hierarchic<P extends WithChildren> extends Entity {
  abstract readonly parentId: Ref<P['id'] | null>;
  protected abstract readonly parent: Ref<P | null>;
  // 一般 indexNote 会被置为单向
  setParent(newParent: P, bidirectional: boolean) {
    const oldParent = this.parent.value;

    if (oldParent?.children?.value) {
      oldParent.children.value = without(oldParent.children.value, this);
    }

    this.parent.value = newParent;
    this.parentId.value = newParent.id;

    if (!bidirectional) {
      return this;
    }

    if (!newParent.children.value) {
      newParent.children.value = [];
    }

    const duplicated = newParent.children.value.find(
      (child) => child.id === this.id || child === this,
    );

    if (duplicated) {
      throw new Error('duplicated child');
    }

    newParent.children.value = [...newParent.children.value, this];
    return this;
  }

  getParent() {
    return this.parent.value;
  }

  hasParent() {
    return !!this.parentId.value;
  }
}
