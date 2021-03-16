import { db } from '../db';
import { DataTypes, UUIDV4, NOW } from 'sequelize';
import { ROOT_NOTEBOOK_ID, SortByEnums, SortDirectEnums } from 'domain/entity';

export const NotebookModel = db.define('Notebook', {
  id: {
    type: DataTypes.UUIDV4,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  attachedNoteId: {
    type: DataTypes.UUIDV4,
  },
  title: {
    type: DataTypes.TEXT,
    defaultValue: '',
    allowNull: false,
  },
  parentId: {
    type: DataTypes.UUIDV4,
    validate: {
      notNullExpectForRoot(value: unknown) {
        if (!value && this.id !== ROOT_NOTEBOOK_ID) {
          throw new Error('parent id can not be empty for non-root notebook');
        }
      },
    },
  },
  sortBy: {
    type: DataTypes.ENUM(
      SortByEnums.CreatedAt,
      SortByEnums.UpdatedAt,
      SortByEnums.Title,
      SortByEnums.Custom,
    ),
    defaultValue: SortByEnums.Title,
    allowNull: false,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sortDirect: {
    type: DataTypes.ENUM(SortDirectEnums.Asc, SortDirectEnums.Desc),
    defaultValue: SortDirectEnums.Asc,
    allowNull: false,
  },
  userCreatedAt: {
    type: DataTypes.DATE,
    defaultValue: NOW,
    allowNull: false,
  },
  userModifiedAt: {
    type: DataTypes.DATE,
    defaultValue: NOW,
    allowNull: false,
  },
});
