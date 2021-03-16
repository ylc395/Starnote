import { Entity } from './Entity';
import { without } from 'lodash';
import type { Ref } from '@vue/reactivity';

export interface WithChildren extends Entity {
  readonly children: Ref<unknown[] | null>;
}

export abstract class Hierarchic<P extends WithChildren> extends Entity {
  abstract readonly parentId: Ref<P['id'] | null>;
  protected abstract readonly parent: Ref<P | null>;
  setParent(newParent: P) {
    if (this.parent.value?.children?.value) {
      this.parent.value.children.value = without(
        this.parent.value.children.value,
        this,
      );
    }

    this.parent.value = newParent;
    this.parentId.value = newParent.id;

    newParent.children?.value;
    if (!newParent.children.value) {
      newParent.children.value = [];
    }

    newParent.children.value.push(this);
  }
}
