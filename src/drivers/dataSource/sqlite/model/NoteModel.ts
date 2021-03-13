import { DataTypes, NOW, UUIDV4 } from 'sequelize';
import { db } from '../db';
import { ROOT_NOTEBOOK_ID } from 'domain/entity';
import { NotebookModel } from './NotebookModel';

export const NoteModel = db.define('Note', {
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
  notebookId: {
    type: DataTypes.UUIDV4,
    defaultValue: ROOT_NOTEBOOK_ID,
    allowNull: false,
    references: {
      model: NotebookModel,
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    defaultValue: '',
    allowNull: false,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
