import { Entity } from './Entity';
import { without } from 'lodash';
import { Expose } from 'class-transformer';
import { Ref, shallowRef } from '@vue/reactivity';

export interface WithChildren<T extends Entity> extends Entity {
  readonly children: Ref<T[] | null>;
}

export abstract class Hierarchic<
  P extends WithChildren<Entity>
> extends Entity {
  protected readonly _parent: Ref<P | null> = shallowRef(null);
  get parent() {
    return this._parent.value;
  }

  @Expose({ name: 'parentId', toClassOnly: true })
  private initialParentId: Entity['id'] | null = null;

  @Expose({ toPlainOnly: true })
  get parentId() {
    try {
      return this.parent?.id || this.initialParentId;
    } catch {
      return this.initialParentId;
    }
  }

  // 一般 indexNote 会被置为单向
  setParent(newParent: P, bidirectional: boolean) {
    const oldParent = this._parent.value;

    if (oldParent?.isEqual(newParent)) {
      return this;
    }

    if (oldParent?.children?.value) {
      oldParent.children.value = without(oldParent.children.value, this);
    }

    this._parent.value = newParent;

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

  isDescendenceOf<T extends Entity>(entity: WithChildren<T>) {
    let node: P | null = this._parent.value;

    while (node) {
      if (entity.isEqual(node)) {
        return true;
      }

      if (node instanceof Hierarchic) {
        node = node.parent;
      } else {
        break;
      }
    }

    return false;
  }

  get ancestors() {
    let node: P | null = this._parent.value;
    const ancestors = [];

    while (node) {
      if (node instanceof Hierarchic) {
        ancestors.unshift(node);
        node = node.parent;
      } else {
        break;
      }
    }

    return ancestors;
  }
}
