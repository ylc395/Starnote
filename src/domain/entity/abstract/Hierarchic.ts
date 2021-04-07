import { Entity } from './Entity';
import { without } from 'lodash';
import { Expose } from 'class-transformer';
import type { Ref } from '@vue/reactivity';

export interface WithChildren<T extends Entity> extends Entity {
  readonly children: Ref<T[] | null>;
}

export abstract class Hierarchic<
  P extends WithChildren<Entity>
> extends Entity {
  protected abstract readonly parent: Ref<P | null>;

  @Expose({ name: 'parentId', toClassOnly: true })
  private initialParentId: Entity['id'] | null = null;

  @Expose({ toPlainOnly: true })
  get parentId() {
    return this.parent.value?.id || this.initialParentId;
  }

  // 一般 indexNote 会被置为单向
  setParent(newParent: P, bidirectional: boolean) {
    const oldParent = this.parent.value;

    if (oldParent?.isEqual(newParent)) {
      return this;
    }

    if (oldParent?.children?.value) {
      oldParent.children.value = without(oldParent.children.value, this);
    }

    this.parent.value = newParent;

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
    let node: P | null = this.getParent();

    while (node) {
      if (entity.isEqual(node)) {
        return true;
      }

      if (node instanceof Hierarchic) {
        node = node.getParent();
      } else {
        break;
      }
    }

    return false;
  }

  getAncestors() {
    const path = [];
    let node: P | null = this.getParent();

    while (node) {
      path.push(node);

      if (node instanceof Hierarchic) {
        node = node.getParent();
      } else {
        break;
      }
    }

    return path;
  }

  getParent() {
    return this.parent.value;
  }
}
