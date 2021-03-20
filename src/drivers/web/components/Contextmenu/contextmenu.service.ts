import { ref, UnwrapRef, provide, InjectionKey } from 'vue';

export class ContextmenuService {
  static token: InjectionKey<ContextmenuService> = Symbol();
  readonly visible = ref(false);
  readonly position = ref({ x: 0, y: 0 });
  open(mousePosition: UnwrapRef<ContextmenuService['position']>) {
    setTimeout(() => {
      this.visible.value = true;
      this.position.value = mousePosition;
    }, 200);
  }
  close() {
    this.visible.value = false;
  }

  static setup() {
    const service = new this();
    provide(ContextmenuService.token, service);
    return service;
  }
}