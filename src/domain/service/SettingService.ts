import { Setting } from 'domain/entity/Setting';
import { container } from 'tsyringe';
import { selfish } from 'utils/helper';

export const token = Symbol();
export class SettingService {
  readonly setting = selfish(container.resolve(Setting));
}
