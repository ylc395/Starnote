import { DataAccessObject } from './DataAccessObject';
import { StarDataObject } from 'domain/entity';
import { noteTable, starTable } from '../table';
export const starDao = new DataAccessObject<StarDataObject>(starTable, {
  belongsTo: {
    table: noteTable,
    foreignKey: starTable.columns.ENTITY_ID,
    reference: noteTable.columns.ID,
    required: true,
  },
});
