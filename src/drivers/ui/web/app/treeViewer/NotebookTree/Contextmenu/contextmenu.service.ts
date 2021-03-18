import { InjectionKey, provide } from '@vue/runtime-core';
import { TreeViewerService } from 'domain/service/TreeViewerService';
import { ContextmenuService as CommonContextmenuService } from 'drivers/ui/web/components/Contextmenu/contextmenu.service';
import { selfish } from 'utils/index';

export class ContextmenuService {
  static token: InjectionKey<ContextmenuService> = Symbol();
  static setup(treeService: TreeViewerService) {
    const service = selfish(new this(treeService));
    provide(this.token, service);

    return service;
  }
  constructor(private readonly treeService: TreeViewerService) {}
  private readonly contextmenu = CommonContextmenuService.setup();

  openContextmenu({
    event,
    node,
  }: {
    event: MouseEvent;
    node: Record<string, never>;
  }) {
    this.contextmenu.open({ x: event.clientX, y: event.clientY });
    this.treeService.setSelectedItem(node.eventKey);
  }
}
