import { EntityTypes, ObjectWithId } from 'domain/entity';
import type { Dao, Query } from 'domain/repository';
import { difference, mapKeys, omit, omitBy, pickBy } from 'lodash';
import { db, NoteTable, NotebookTable, StarTable } from './table';

interface HasOneConfig {
  entity: EntityTypes;
  foreignKey: string;
  reference: string;
  as: string;
  excludes?: string[];
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
    private readonly hasOne?: HasOneConfig,
  ) {}
  private getFullWhere(where: Query<T>) {
    return mapKeys(where, (_, key) => `${this.tableName}.${key}`);
  }

  private getQueryWithAssociation<K>(query: QueryBuilder, attributes?: K[]) {
    if (!this.hasOne) {
      return query;
    }

    const mapTableFields = (key: K | string) => `${this.tableName}.${key}`;
    const { entity, as, foreignKey, reference, excludes = [] } = this.hasOne;

    const keysInTable = attributes
      ? attributes.map(mapTableFields)
      : Object.values(COLUMNS_MAP[this.tableName]).map(mapTableFields);

    const keysInAssoc = difference(
      Object.values(COLUMNS_MAP[entity]),
      excludes,
    ).map((key) => `${as}.${key} as ${as}.${key}`);

    return query
      .clear('select')
      .select(...keysInTable, ...keysInAssoc)
      .leftJoin(
        { [as]: entity },
        `${this.tableName}.${foreignKey}`,
        `${as}.${reference}`,
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private processAssociation(rows: any) {
    if (!this.hasOne || !rows) {
      return rows;
    }

    const { as } = this.hasOne;
    const isAssociation = (_: never, key: string) => key.startsWith(`${as}.`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const associate = (row: any) => {
      const main = omitBy(row, isAssociation);
      const association = pickBy(row, isAssociation);

      main[as] = mapKeys(association, (_, key) => key.replace(`${as}.`, ''));

      return main;
    };

    return Array.isArray(rows) ? rows.map(associate) : associate(rows);
  }

  one<K extends keyof Query<T>>(where: Query<T>, attributes?: K[]) {
    let query = db(this.tableName)
      .select(...(attributes || ['*']))
      .where(this.getFullWhere(where));

    query = this.getQueryWithAssociation(query, attributes);
    return query.first().then(this.processAssociation.bind(this));
  }

  all<K extends keyof Query<T>>(where?: Query<T> | K[], attributes?: K[]) {
    let query = db(this.tableName);

    if (!where) {
      query = query.select('*');
    } else if (Array.isArray(where)) {
      query = query.select(...where);
    } else {
      query = query
        .select(...(attributes || ['*']))
        .where(this.getFullWhere(where));
    }

    query = this.getQueryWithAssociation(query, attributes);

    return query.then(this.processAssociation.bind(this));
  }

  deleteById(id: string) {
    return db(this.tableName)
      .where({ id })
      .update({ valid: 0 })
      .then(() => undefined);
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

  hardDeleteById(id: string) {
    return db(this.tableName)
      .where({ id })
      .del()
      .then(() => undefined);
  }
}
