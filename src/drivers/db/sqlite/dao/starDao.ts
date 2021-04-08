import { DataAccessObject } from './DataAccessObject';
import { StarDataObject, EntityTypes } from 'domain/entity';
import { NoteTable, StarTable } from '../table';
export const starDao = new DataAccessObject<StarDataObject>(EntityTypes.Star, {
  belongsTo: {
    entity: EntityTypes.Note,
    foreignKey: StarTable.COLUMNS.ENTITY_ID,
    reference: NoteTable.COLUMNS.ID,
    required: true,
    scope: { valid: 1 },
  },
});
