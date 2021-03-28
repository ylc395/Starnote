import { DataTypes, NOW, UUIDV4 } from 'sequelize';
import { db } from '../db';

export const NoteModel = db.define(
  'Note',
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
