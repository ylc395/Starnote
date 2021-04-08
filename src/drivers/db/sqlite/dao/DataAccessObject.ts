/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityTypes, ObjectWithId } from 'domain/entity';
import type { Dao, Query } from 'domain/repository';
import {
  difference,
  isEmpty,
  map,
  mapKeys,
  omit,
  omitBy,
  partialRight,
  pickBy,
  without,
} from 'lodash';
import { db, NoteTable, NotebookTable, StarTable } from '../table';

interface Config {
  belongsTo?: {
    entity: EntityTypes;
    foreignKey: string; // 本表的外键
    reference: string; // 目标表的主键
    as?: string;
    excludes?: string[];
    required?: boolean;
    scope?: Record<string, any>;
  };
  hasMany?: {
    entity: EntityTypes;
    foreignKey: string; // 目标表的外键
  }[];
  scope?: Record<string, any>;
}

type QueryBuilder = ReturnType<typeof db>;

const COLUMNS_MAP = {
  [EntityTypes.Note]: NoteTable.COLUMNS,
  [EntityTypes.Notebook]: NotebookTable.COLUMNS,
  [EntityTypes.Star]: StarTable.COLUMNS,
} as const;

export class DataAccessObject<T> implements Dao<T> {
  constructor(
    private readonly tableName: EntityTypes,
    private readonly config?: Config,
  ) {}
  private getFullWhere(where: Query<T> = {}) {
    const scope = this.config?.scope || {};

    return mapKeys(
      { ...scope, ...where },
      (_, key) => `${this.tableName}.${key}`,
    );
  }

  private getQueryWithAssociation<K>(query: QueryBuilder, attributes?: K[]) {
    if (!this.config?.belongsTo) {
      return query;
    }

    const mapTableFields = (key: K | string) => `${this.tableName}.${key}`;
    const {
      entity,
      as,
      foreignKey,
      reference,
      excludes = [],
      required = false,
      scope = {},
    } = this.config.belongsTo;

    const keysInTable = attributes
      ? attributes.map(mapTableFields)
      : Object.values(COLUMNS_MAP[this.tableName]).map(mapTableFields);

    const keysInAssoc = as
      ? difference(Object.values(COLUMNS_MAP[entity]), excludes).map(
          (key) => `${as}.${key} as ${as}.${key}`,
        )
      : [];

    const joinQuery = query
      .clear('select')
      .select(...keysInTable, ...keysInAssoc);

    return joinQuery[required ? 'join' : 'leftJoin'](
      as ? { [as]: entity } : entity, // set alias for joined table
      {
        ...mapKeys(scope, (_, key) => `${as || entity}.${key}`),
        [`${this.tableName}.${foreignKey}`]: `${as || entity}.${reference}`,
      },
    );
  }

  private processAssociation(rows: any) {
    if (!this.config?.belongsTo || !rows) {
      return rows;
    }

    const { as } = this.config.belongsTo;
    const isAssociation = (_: never, key: string) => key.startsWith(`${as}.`);

    const associate = (row: any) => {
      const main = omitBy(row, isAssociation);
      const association = pickBy(row, isAssociation);

      if (as) {
        main[as] = mapKeys(association, (_, key) => key.replace(`${as}.`, ''));
      }

      return main;
    };

    return Array.isArray(rows) ? rows.map(associate) : associate(rows);
  }

  one<K extends keyof Query<T>>(where: Query<T>, attributes?: K[]) {
    const query = db(this.tableName)
      .select(...(attributes || ['*']))
      .where(this.getFullWhere(where));

    return this.getQueryWithAssociation(query, attributes)
      .first()
      .then(this.processAssociation.bind(this));
  }

  all<K extends keyof Query<T>>(where?: Query<T> | K[], attributes?: K[]) {
    let query = db(this.tableName);

    if (!where) {
      query = query.select('*');
    } else if (Array.isArray(where)) {
      query = query.select(...where);
    } else {
      query = query.select(...(attributes || ['*']));
    }

    query = query.where(this.getFullWhere(Array.isArray(where) ? {} : where));

    return this.getQueryWithAssociation(query, attributes).then(
      this.processAssociation.bind(this),
    );
  }

  private async deleteByIds(
    ids: string[],
    lastStep = false,
    tableName?: EntityTypes,
  ) {
    if (!this.config?.hasMany || lastStep) {
      return db(tableName || this.tableName)
        .whereIn('id', ids)
        .update({ valid: 0 })
        .then(() => undefined);
    }

    const idsMap = {
      [this.tableName]: ids,
    } as Record<EntityTypes, string[]>;
    const self = this.config.hasMany.find(
      ({ entity }) => entity === this.tableName,
    );

    const getIds = (tableName: EntityTypes, reference: string, ids: string[]) =>
      db(tableName)
        .select('id')
        .whereIn(reference, ids)
        .then(partialRight(map, 'id')) as Promise<string[]>;

    if (self) {
      const { foreignKey } = self;
      let subIds: string[] = ids;

      do {
        subIds = await getIds(this.tableName, foreignKey, subIds);
        idsMap[this.tableName] = idsMap[this.tableName].concat(subIds);
      } while (!isEmpty(subIds));
    }

    for (const assc of without(this.config.hasMany, self)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { entity, foreignKey } = assc!;
      idsMap[entity] = await getIds(entity, foreignKey, idsMap[this.tableName]);
    }

    for (const [entity, ids] of Object.entries(idsMap)) {
      this.deleteByIds(ids, true, entity as EntityTypes);
    }
  }

  async deleteById(id: string) {
    return this.deleteByIds([id]);
  }

  update(dataObject: T & ObjectWithId) {
    return db(this.tableName)
      .where({ id: dataObject.id })
      .update(omit(dataObject, ['id']))
      .then(() => undefined);
  }

  create(dataObject: T & ObjectWithId) {
    return db(this.tableName)
      .insert(dataObject)
      .then(() => undefined);
  }

  hardDeleteByIds(ids: string[]) {
    return db(this.tableName)
      .whereIn('id', ids)
      .del()
      .then(() => undefined);
  }
}
