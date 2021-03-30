import { Setting } from 'domain/entity/Setting';
import { container } from 'tsyringe';

export const token = Symbol();
export class SettingService {
  private readonly setting = container.resolve(Setting);
  get(key: keyof Setting) {
    return this.setting[key].value;
  }
}
