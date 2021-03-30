import { db } from '../db';
import { DataTypes, UUIDV4, NOW } from 'sequelize';
import { ROOT_NOTEBOOK_ID } from 'domain/entity';
import { SortByEnums, SortDirectEnums } from 'domain/entity';
import { NoteModel } from './NoteModel';

export const NotebookModel = db.define(
  'Notebook',
  {
    id: {
      type: DataTypes.UUIDV4,
      defaultValue: UUIDV4,
      primaryKey: true,
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
    valid: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    defaultScope: {
      where: { valid: 1 },
    },
  },
);

export const IndexNote = NotebookModel.belongsTo(NoteModel, {
  keyType: DataTypes.UUIDV4,
  as: 'indexNote',
  foreignKey: 'indexNoteId',
  constraints: false,
});

NoteModel.belongsTo(NotebookModel, {
  keyType: DataTypes.UUIDV4,
  constraints: false,
  foreignKey: {
    name: 'parentId',
    allowNull: false,
    defaultValue: ROOT_NOTEBOOK_ID,
  },
});
