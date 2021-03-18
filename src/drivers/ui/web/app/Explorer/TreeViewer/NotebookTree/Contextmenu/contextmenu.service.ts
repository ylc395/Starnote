import { InjectionKey, provide, inject } from '@vue/runtime-core';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import { ContextmenuService as CommonContextmenuService } from 'drivers/ui/web/components/Contextmenu/contextmenu.service';
import { selfish } from 'utils/index';

export class ContextmenuService {
  static token: InjectionKey<ContextmenuService> = Symbol();
  static setup() {
    const service = selfish(new this());
    provide(this.token, service);

    return service;
  }
  private readonly contextmenu = CommonContextmenuService.setup();
  private readonly notebookTree = inject<NotebookTreeService>(token)!;

  openContextmenu({
    event,
    node,
  }: {
    event: MouseEvent;
    node: Record<string, never>;
  }) {
    this.contextmenu.open({ x: event.clientX, y: event.clientY });
    this.notebookTree.setSelectedItem(node.eventKey);
  }
}
