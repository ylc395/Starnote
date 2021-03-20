import { computed, provide, shallowRef } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import { isTreeItem } from 'domain/service/NotebookTreeService';
import type { TreeItem } from 'domain/service/NotebookTreeService';
import { ContextmenuService as CommonContextmenuService } from 'drivers/web/components/Contextmenu/contextmenu.service';
import { selfish } from 'utils/index';

export class ContextmenuService {
  readonly token: InjectionKey<ContextmenuService> = Symbol();
  static setup() {
    const service = selfish(new this());
    provide(service.token, service);

    return service;
  }
  private readonly contextmenu = CommonContextmenuService.setup();
  private readonly _context: Ref<TreeItem | null> = shallowRef(null);
  readonly context = computed(() => {
    return this._context.value;
  });

  openContextmenu({ event, item }: { event: MouseEvent; item: TreeItem }) {
    console.log(111);

    if (!isTreeItem(item)) {
      return;
    }

    this.contextmenu.open({ x: event.clientX, y: event.clientY });
    this._context.value = item;
  }
}
