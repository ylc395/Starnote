import type { GlobalLogger } from 'js-logger';
import type { InjectionToken } from 'tsyringe';
export const token: InjectionToken<GlobalLogger> = Symbol();
