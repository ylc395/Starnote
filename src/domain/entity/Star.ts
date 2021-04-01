import { ref, shallowReadonly, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Expose, Transform, Type } from 'class-transformer';
import { Note } from './Note';
import { Entity } from './abstract/Entity';
import {
  DataMapper,
  DataMapperStatic,
  dataObjectToInstance,
  instanceToDataObject,
  RefTransform,
  DayjsRefTransform,
} from './abstract/DataMapper';
import { ListItem } from './abstract/ListItem';
import { staticImplements } from 'utils/types';

@staticImplements<DataMapperStatic<StarDataObject>>()
export class Star
  extends Entity
  implements ListItem, DataMapper<StarDataObject> {
  @RefTransform
  readonly sortOrder = ref(0);

  @Type(() => Note)
  @Expose({ toClassOnly: true })
  @Transform(
    ({ value }) => shallowReadonly(shallowRef(value?.id ? value : null)),
    { toClassOnly: true },
  )
  readonly entity: Ref<Note | null> = shallowReadonly(shallowRef(null));

  @Expose({ toPlainOnly: true })
  get entityId() {
    return this.entity.value?.id || null;
  }

  @DayjsRefTransform
  readonly userCreatedAt: Ref<Dayjs> = shallowRef(dayjs());

  toDataObject() {
    return instanceToDataObject<this, StarDataObject>(this);
  }

  constructor(entity: Note) {
    super();
    this.entity = shallowRef(entity);
  }

  static from(dataObject: StarDataObject) {
    return dataObjectToInstance(Star, dataObject);
  }
}

export interface StarDataObject {
  readonly id?: string;
  readonly entityId?: string;
  readonly entity?: Note;
  readonly sortOrder?: number;
  readonly userCreatedAt?: string;
}
