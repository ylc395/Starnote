import { Do, Entity } from 'domain/entity';
import type { Dao, Query } from 'domain/repository';
import { isArray } from 'lodash';
import { db } from "./db";
type SequelizeModal = ReturnType<typeof db['define']>;

export function daoAdaptor<E extends Entity>(model: SequelizeModal): Dao<E> {
    type RawRow = Do<E>;
    type Attributes = (keyof RawRow)[]

    return {
        one(where: Query<E>, attributes?: Attributes) {
            return attributes ? model.findOne({ where, attributes }) as unknown as Promise<Pick<RawRow, typeof attributes[number]>>
                            : model.findOne({where}) as Promise<RawRow | null>
        },
        all(where?: Query<E> | Attributes, attributes?: Attributes) {
            if (!where) {
                return model.findAll() as unknown as Promise<RawRow[]>; 
            }

            if (isArray(where)) {
               return model.findAll({ attributes: where }) as unknown as Promise<Pick<RawRow, typeof where[number]>[]>;
            }

            return attributes ? model.findAll({ where, attributes }) as unknown as Promise<Pick<RawRow, typeof attributes[number]>[]>
                            : model.findAll({ where }) as unknown as Promise<RawRow[]>
        },
        deleteById(id) {
            return model.destroy({where: {id}}).then(); 
        },
        update(dataObject) {
            return model.update(dataObject, {where: {id: dataObject.id}}).then();
        },
        create(dataObject) {
            return model.create(dataObject).then();
        },  
    };
}
