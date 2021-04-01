import {
  classToPlain,
  Expose,
  plainToClass,
  Transform,
} from 'class-transformer';
import { ref, shallowRef } from '@vue/reactivity';
import { Class } from 'utils/types';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export interface DataMapper<T> {
  toDataObject(): T;
}

export interface DataMapperStatic<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): DataMapper<T>;
  from(dataObject: T): DataMapper<T>;
}

export const dataObjectToInstance = <T, K>(aClass: Class<T>, dataObject: K) =>
  plainToClass(aClass, dataObject, {
    exposeDefaultValues: true,
    excludeExtraneousValues: true,
  });

export const instanceToDataObject = <T, K>(instance: T) =>
  classToPlain(instance, { strategy: 'excludeAll' }) as K;

export const RefTransform = (
  target: DataMapper<unknown>,
  propertyName: string,
) => {
  const toClass = Transform(({ value }) => ref(value), { toClassOnly: true });
  const toPlain = Transform(({ value }) => value.value, { toPlainOnly: true });
  const expose = Expose();

  toClass(target, propertyName);
  toPlain(target, propertyName);
  expose(target, propertyName);
};

export const DayjsRefTransform = (
  target: DataMapper<unknown>,
  propertyName: string,
) => {
  const TIME_DATA_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS Z';
  const toClass = Transform(
    ({ value }) => shallowRef(dayjs(value, TIME_DATA_FORMAT)),
    { toClassOnly: true },
  );

  const toPlain = Transform(
    ({ value }) => value.value.format(TIME_DATA_FORMAT),
    {
      toPlainOnly: true,
    },
  );
  const expose = Expose();

  toClass(target, propertyName);
  toPlain(target, propertyName);
  expose(target, propertyName);
};
