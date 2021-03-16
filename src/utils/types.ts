import type { Ref, UnwrapRef } from "@vue/reactivity";
export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: never[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

export type UnwrapAllRefs<T> = {
   [K in keyof T]: T[K] extends Ref
    ? UnwrapRef<T[K]>
    : T[K]
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type Class<T> = new (...args: any[]) => T;