import { Do, Entity } from 'domain/entity';
import type { Dao, Query } from 'domain/repository';
import { isArray } from 'lodash';
import { db } from './db';
type SequelizeModal = ReturnType<typeof db['define']>;
interface Options {
  include?: SequelizeModal | { model: SequelizeModal; as: string };
}

export function daoAdaptor<E extends Entity>(
  model: SequelizeModal,
  options: Options = {},
): Dao<E> {
  type RawRow = Do<E>;
  type Attributes = (keyof RawRow)[];

  return {
    one(where: Query<E>, attributes?: Attributes) {
      return attributes
        ? ((model.findOne({
            where,
            attributes,
            raw: true,
            ...options,
          }) as unknown) as Promise<Pick<RawRow, typeof attributes[number]>>)
        : (model.findOne({ where, raw: true }) as Promise<RawRow | null>);
    },
    all(where?: Query<E> | Attributes, attributes?: Attributes) {
      if (!where) {
        return (model.findAll({ raw: true, ...options }) as unknown) as Promise<
          RawRow[]
        >;
      }

      if (isArray(where)) {
        return (model.findAll({
          raw: true,
          attributes: where,
          ...options,
        }) as unknown) as Promise<Pick<RawRow, typeof where[number]>[]>;
      }

      return attributes
        ? ((model.findAll({
            raw: true,
            where,
            attributes,
            ...options,
          }) as unknown) as Promise<Pick<RawRow, typeof attributes[number]>[]>)
        : ((model.findAll({
            where,
            raw: true,
            ...options,
          }) as unknown) as Promise<RawRow[]>);
    },
    deleteById(id) {
      return model.destroy({ where: { id } }).then();
    },
    update(dataObject) {
      return model.update(dataObject, { where: { id: dataObject.id } }).then();
    },
    create(dataObject) {
      return model.create(dataObject).then();
    },
  };
}
