import dayjs from 'dayjs';
import type { GlobalLogger } from 'js-logger';
import type { InjectionToken } from 'tsyringe';
import { container, singleton } from 'tsyringe';
export const token: InjectionToken<GlobalLogger> = Symbol();

@singleton()
export class LoggerService {
  private readonly logger = container.resolve(token);
  constructor() {
    this.logger.setLevel(this.logger.DEBUG);
  }

  debug(module: string, log: string | Record<string, unknown>) {
    this.logger.debug(
      `${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')} 【${module}】`,
      typeof log === 'string' ? log : JSON.stringify(log),
    );
  }
}
