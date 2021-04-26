import dayjs from 'dayjs';
import { isDataMapper } from 'domain/entity';
import type { ILogHandler } from 'js-logger';
import { mapValues } from 'lodash';
type LogHandlerParams = Parameters<ILogHandler>;

export default function formatter(
  message: LogHandlerParams[0],
  context: LogHandlerParams[1],
): string {
  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
  const level = context.level.name;
  const [module, details] = message;
  const normalizedDetails = mapValues(details, (val) => {
    return isDataMapper(val) ? val.toDataObject() : val;
  });

  return JSON.stringify({
    timestamp,
    level,
    module,
    details: normalizedDetails,
  });
}
