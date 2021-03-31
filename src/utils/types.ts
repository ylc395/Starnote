// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class<T> = new (...args: any[]) => T;

export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}
