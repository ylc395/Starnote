import { DataAccessObject } from './DataAccessObject';
import { StarDataObject } from 'domain/entity';
import { NoteTable, StarTable } from '../table';
export const starDao = new DataAccessObject<StarDataObject>(
  {
    name: StarTable.TABLE_NAME,
    columns: StarTable.COLUMNS,
  },
  {
    belongsTo: {
      entity: NoteTable.TABLE_NAME,
      foreignKey: StarTable.COLUMNS.ENTITY_ID,
      reference: NoteTable.COLUMNS.ID,
      required: true,
      columns: NoteTable.COLUMNS,
    },
  },
);
