import { isWithContextmenu } from 'domain/entity/abstract/ListItem';
import { uniqueId } from 'lodash';
import { ref, UnwrapRef, provide, Ref, shallowRef, shallowReadonly } from 'vue';

export const token = Symbol(uniqueId('ContextmenuToken-'));
export function useContextmenu<Context = unknown>() {
  const visible = ref(false);
  const position = ref({ x: 0, y: 0 });
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  const _context: Ref<Context | null | undefined> = shallowRef(null);

  function open(
    mousePosition: MouseEvent | UnwrapRef<typeof position>,
    context?: Context,
    delay = 200,
  ) {
    close();

    _context.value = context;

    if (openTimer) {
      clearTimeout(openTimer);
    }

    document.addEventListener('click', close);
    document.addEventListener('contextmenu', close);

    openTimer = setTimeout(() => {
      visible.value = true;
      position.value =
        'type' in mousePosition
          ? { x: mousePosition.clientX, y: mousePosition.clientY }
          : mousePosition;
      openTimer = null;

      if (isWithContextmenu(_context.value)) {
        _context.value.withContextmenu.value = true;
      }
    }, delay);
  }

  function close(e?: MouseEvent) {
    if (!visible.value) {
      return;
    }

    const submenuClassName =
      '.ant-menu-submenu-title, .ant-menu-submenu-title *';

    if ((e?.target as HTMLElement).matches(submenuClassName)) {
      return;
    }

    document.removeEventListener('click', close);
    document.removeEventListener('contextmenu', close);

    if (isWithContextmenu(_context.value)) {
      _context.value.withContextmenu.value = false;
    }

    _context.value = null;
    visible.value = false;
  }

  const service = {
    visible,
    position,
    open,
    close,
    context: shallowReadonly(_context),
  };

  provide(token, service);
  return service;
}
