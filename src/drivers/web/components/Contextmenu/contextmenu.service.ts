import { isWithContextmenu } from 'domain/entity/abstract/ListItem';
import { uniqueId } from 'lodash';
import { selfish } from 'utils/index';
import { ref, UnwrapRef, provide, InjectionKey, Ref, shallowRef } from 'vue';

export class ContextmenuService<T = unknown> {
  token: InjectionKey<ContextmenuService<T>> = Symbol(
    uniqueId('ContextmenuToken-'),
  );
  readonly visible = ref(false);
  readonly position = ref({ x: 0, y: 0 });
  context: Ref<T | null | undefined> = shallowRef(null);
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  open(
    mousePosition: MouseEvent | UnwrapRef<ContextmenuService['position']>,
    context?: T,
    delay = 200,
  ) {
    this.close();

    this.context.value = context;

    if (this.openTimer) {
      clearTimeout(this.openTimer);
    }

    document.addEventListener('click', this.close);
    document.addEventListener('contextmenu', this.close);

    this.openTimer = setTimeout(() => {
      this.visible.value = true;
      this.position.value =
        'type' in mousePosition
          ? { x: mousePosition.clientX, y: mousePosition.clientY }
          : mousePosition;
      this.openTimer = null;

      if (isWithContextmenu(this.context)) {
        this.context.withContextmenu.value = true;
      }
    }, delay);
  }

  private close = () => {
    if (!this.visible.value) {
      return;
    }

    document.removeEventListener('click', this.close);
    document.removeEventListener('contextmenu', this.close);

    if (isWithContextmenu(this.context)) {
      this.context.withContextmenu.value = false;
    }

    this.context.value = null;
    this.visible.value = false;
  };

  static setup<T>() {
    const service = selfish(new this<T>());
    provide(service.token, service);
    return service;
  }
}
