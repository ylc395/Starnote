import { computed, ref, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Expose, Transform } from 'class-transformer';
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

  @Expose({ toClassOnly: true })
  @Transform(({ obj }) => shallowRef(obj.entity), { toClassOnly: true })
  readonly entity: Ref<Note | null> = shallowRef(null);
  get entityName() {
    return computed(() => this.entity.value?.title.value || '');
  }

  @Expose()
  readonly entityId: string = '';

  @DayjsRefTransform
  readonly userCreatedAt: Ref<Dayjs> = shallowRef(dayjs());

  toDataObject() {
    return instanceToDataObject<this, StarDataObject>(this);
  }

  static from(dataObject: StarDataObject) {
    if (!dataObject.entityId && !dataObject.entity) {
      throw new Error('invalid star initialized!');
    }

    return dataObjectToInstance(Star, {
      ...dataObject,
      ...(dataObject.entity ? { entityId: dataObject.entity.id } : null),
    });
  }
}

export interface StarDataObject {
  readonly id?: string;
  readonly entityId?: string;
  readonly entity?: Note;
  readonly sortOrder?: number;
  readonly userCreatedAt?: string;
}
