/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ObjectWithId } from 'domain/entity';
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
import { db, TableName } from '../table';

interface Config {
  belongsTo?: {
    entity: TableName;
    foreignKey: string; // 本表的外键
    reference: string; // 目标表的主键
    as?: string;
    excludes?: string[];
    required?: boolean;
    scope?: Record<string, any>;
    columns: Record<string, string>;
  };
  hasMany?: {
    entity: TableName;
    foreignKey: string; // 目标表的外键
    columns?: Record<string, string>;
  }[];
  scope?: Record<string, any>;
}

type QueryBuilder = ReturnType<typeof db>;

export class DataAccessObject<T> implements Dao<T> {
  constructor(
    private readonly table: {
      name: TableName;
      columns: Record<string, string>;
    },
    private readonly config?: Config,
  ) {}
  private getFullWhere(where: Query<T> = {}) {
    const scope = this.config?.scope || {};

    return mapKeys(
      { ...scope, ...where },
      (_, key) => `${this.table.name}.${key}`,
    );
  }

  private getQueryWithAssociation<K>(query: QueryBuilder, attributes?: K[]) {
    if (!this.config?.belongsTo) {
      return query;
    }

    const mapTableFields = (key: K | string) => `${this.table.name}.${key}`;
    const {
      entity,
      as,
      foreignKey,
      reference,
      excludes = [],
      required = false,
      scope = {},
      columns,
    } = this.config.belongsTo;

    const keysInTable = attributes
      ? attributes.map(mapTableFields)
      : Object.values(this.table.columns).map(mapTableFields);

    const keysInAssoc = as
      ? difference(Object.values(columns), excludes).map(
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
        [`${this.table.name}.${foreignKey}`]: `${as || entity}.${reference}`,
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
    const query = db(this.table.name)
      .select(...(attributes || ['*']))
      .where(this.getFullWhere(where));

    return this.getQueryWithAssociation(query, attributes)
      .first()
      .then(this.processAssociation.bind(this));
  }

  all<K extends keyof Query<T>>(where?: Query<T> | K[], attributes?: K[]) {
    let query = db(this.table.name);

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

  async deleteByIds(ids: string[], lastStep = false, tableName?: TableName) {
    if (!this.config?.hasMany || lastStep) {
      return db(tableName || this.table.name)
        .whereIn('id', ids)
        .del()
        .then(() => undefined);
    }

    const idsMap = {
      [this.table.name]: ids,
    } as Record<TableName, string[]>;
    const self = this.config.hasMany.find(
      ({ entity }) => entity === this.table.name,
    );

    const getIds = (tableName: TableName, reference: string, ids: string[]) =>
      db(tableName)
        .select('id')
        .whereIn(reference, ids)
        .then(partialRight(map, 'id')) as Promise<string[]>;

    if (self) {
      const { foreignKey } = self;
      let subIds: string[] = ids;

      do {
        subIds = await getIds(this.table.name, foreignKey, subIds);
        idsMap[this.table.name] = idsMap[this.table.name].concat(subIds);
      } while (!isEmpty(subIds));
    }

    for (const assc of without(this.config.hasMany, self)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { entity, foreignKey } = assc!;
      idsMap[entity] = await getIds(
        entity,
        foreignKey,
        idsMap[this.table.name],
      );
    }

    for (const [entity, ids] of Object.entries(idsMap)) {
      this.deleteByIds(ids, true, entity as TableName);
    }
  }

  async deleteById(id: string) {
    return this.deleteByIds([id]);
  }

  update(dataObject: T & ObjectWithId) {
    return db(this.table.name)
      .where({ id: dataObject.id })
      .update(omit(dataObject, ['id']))
      .then(() => undefined);
  }

  create(dataObject: T & ObjectWithId) {
    return db(this.table.name)
      .insert(dataObject)
      .then(() => undefined);
  }
}
